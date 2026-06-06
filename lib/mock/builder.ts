import { MOCK_STORE } from './seed'

type Row = Record<string, unknown>
type Filter = (row: Row) => boolean
type Op = 'select' | 'insert' | 'upsert' | 'update' | 'delete'

// Échappe d'abord les métacaractères regex, puis substitue % et _ SQL
function matchLike(value: string, pattern: string): boolean {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  const regexStr = escaped.replace(/%/g, '.*').replace(/_/g, '.')
  return new RegExp(`^${regexStr}$`).test(value)
}

const PGRST116 = { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: 'Results contain 0 rows' }

export class MockQueryBuilder {
  private _table: string
  private _filters: Filter[] = []
  private _limit: number | null = null
  private _rangeFrom: number | null = null
  private _rangeTo: number | null = null
  private _orderCol: string | null = null
  private _orderAsc: boolean = true
  private _isSingle = false
  private _isMaybe  = false
  private _isCount  = false
  private _isHead   = false
  private _shouldReturn = false
  private _op: Op = 'select'
  private _writeData: Row | Row[] | null = null
  private _upsertConflict: string | null = null

  constructor(table: string) {
    this._table = table
  }

  select(_cols = '*', opts?: { count?: string; head?: boolean }) {
    if (this._op !== 'select') {
      this._shouldReturn = true
      return this
    }
    if (opts?.count) this._isCount = true
    if (opts?.head)  this._isHead  = true
    return this
  }

  eq(col: string, val: unknown) {
    if (col.includes('.')) {
      const [tableRef, field] = col.split('.')
      this._filters.push((row) => {
        const nested = row[tableRef]
        if (Array.isArray(nested)) {
          return (nested as Row[]).some((n) => n[field] === val)
        }
        return (nested as Row | undefined)?.[field] === val
      })
    } else {
      this._filters.push((row) => row[col] === val)
    }
    return this
  }

  neq(col: string, val: unknown) {
    this._filters.push((row) => row[col] !== val)
    return this
  }

  in(col: string, vals: unknown[]) {
    this._filters.push((row) => vals.includes(row[col]))
    return this
  }

  like(col: string, pattern: string) {
    this._filters.push((row) => matchLike(String(row[col] ?? ''), pattern))
    return this
  }

  ilike(col: string, pattern: string) {
    this._filters.push((row) =>
      matchLike(String(row[col] ?? '').toLowerCase(), pattern.toLowerCase())
    )
    return this
  }

  gte(col: string, val: unknown) {
    this._filters.push((row) => (row[col] as string) >= (val as string))
    return this
  }

  lte(col: string, val: unknown) {
    this._filters.push((row) => (row[col] as string) <= (val as string))
    return this
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this._orderCol = col
    this._orderAsc = opts?.ascending !== false
    return this
  }

  limit(n: number) {
    this._limit = n
    return this
  }

  range(from: number, to: number) {
    this._rangeFrom = from
    this._rangeTo = to
    return this
  }

  single() {
    this._isSingle = true
    return this
  }

  maybeSingle() {
    this._isMaybe = true
    return this
  }

  insert(data: Row | Row[]) {
    this._op = 'insert'
    this._writeData = data
    return this
  }

  upsert(data: Row, opts?: { onConflict?: string; ignoreDuplicates?: boolean }) {
    this._op = 'upsert'
    this._writeData = data
    this._upsertConflict = opts?.onConflict ?? null
    return this
  }

  update(data: Partial<Row>) {
    this._op = 'update'
    this._writeData = data as Row
    return this
  }

  delete() {
    this._op = 'delete'
    return this
  }

  then<TResult1 = { data: unknown; error: unknown; count?: number }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown; error: unknown; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this._execute()).then(onfulfilled, onrejected as never)
  }

  private _execute(): { data: unknown; error: unknown; count?: number } {
    const store: Row[] = MOCK_STORE[this._table] ?? []

    if (this._op === 'insert') {
      const rows = Array.isArray(this._writeData) ? this._writeData : [this._writeData!]
      const inserted: Row[] = rows.map((row) => ({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...row,
      }))
      inserted.forEach((r) => store.push(r))
      return { data: this._shouldReturn ? (this._isSingle ? inserted[0] : inserted) : null, error: null }
    }

    if (this._op === 'upsert') {
      const data = this._writeData as Row
      const conflictCol = this._upsertConflict
      const existing = conflictCol ? store.find((r) => r[conflictCol] === data[conflictCol]) : null
      if (existing) {
        Object.assign(existing, data)
        return { data: this._shouldReturn ? existing : null, error: null }
      }
      // Pas de updated_at générique — chaque table gère ses propres colonnes
      const newRow: Row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...data }
      store.push(newRow)
      return { data: this._shouldReturn ? newRow : null, error: null }
    }

    if (this._op === 'update') {
      const updated: Row[] = []
      store.forEach((row) => {
        if (this._filters.every((f) => f(row))) {
          Object.assign(row, this._writeData)
          updated.push(row)
        }
      })
      if (this._shouldReturn) {
        const result = this._isSingle ? (updated[0] ?? null) : updated
        return { data: result, error: null }
      }
      return { data: null, error: null }
    }

    if (this._op === 'delete') {
      const toDelete = store.filter((row) => this._filters.every((f) => f(row)))
      toDelete.forEach((row) => {
        const idx = store.indexOf(row)
        if (idx !== -1) store.splice(idx, 1)
      })
      return { data: null, error: null }
    }

    // select
    let rows = store.filter((row) => this._filters.every((f) => f(row)))

    if (this._orderCol) {
      const col = this._orderCol
      const asc = this._orderAsc
      rows = [...rows].sort((a, b) => {
        const av = a[col] as string, bv = b[col] as string
        return asc ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0)
      })
    }

    const totalCount = rows.length

    if (this._rangeFrom !== null && this._rangeTo !== null) {
      rows = rows.slice(this._rangeFrom, this._rangeTo + 1)
    } else if (this._limit !== null) {
      rows = rows.slice(0, this._limit)
    }

    if (this._isCount && this._isHead) {
      return { data: null, count: totalCount, error: null }
    }

    if (this._isSingle) {
      if (rows.length === 0) return { data: null, error: PGRST116 }
      return { data: rows[0], error: null }
    }

    if (this._isMaybe) {
      return { data: rows[0] ?? null, error: null }
    }

    return { data: rows, error: null }
  }
}
