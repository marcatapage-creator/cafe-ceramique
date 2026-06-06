import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { MockQueryBuilder } from './builder'
import { MOCK_STORE } from './seed'

const TABLE = 'test_rows'

type TestRow = { id: string; name: string; age: number; status: string; label?: string }

beforeEach(() => {
  MOCK_STORE[TABLE] = [
    { id: '1', name: 'Alice', age: 30, status: 'active' },
    { id: '2', name: 'Bob',   age: 25, status: 'inactive' },
    { id: '3', name: 'Carol', age: 35, status: 'active' },
  ] satisfies TestRow[]
})

afterEach(() => {
  delete MOCK_STORE[TABLE]
})

describe('select / filters', () => {
  it('returns all rows with no filter', async () => {
    const { data, error } = await new MockQueryBuilder(TABLE).select()
    expect(error).toBeNull()
    expect((data as TestRow[]).length).toBe(3)
  })

  it('filters with eq', async () => {
    const { data } = await new MockQueryBuilder(TABLE).select().eq('status', 'active')
    expect((data as TestRow[]).length).toBe(2)
    expect((data as TestRow[]).every(r => r.status === 'active')).toBe(true)
  })

  it('filters with neq', async () => {
    const { data } = await new MockQueryBuilder(TABLE).select().neq('status', 'active')
    expect((data as TestRow[]).map(r => r.name)).toEqual(['Bob'])
  })

  it('filters with in', async () => {
    const { data } = await new MockQueryBuilder(TABLE).select().in('id', ['1', '3'])
    expect((data as TestRow[]).map(r => r.id)).toEqual(['1', '3'])
  })

  it('filters with like (prefix %)', async () => {
    const { data } = await new MockQueryBuilder(TABLE).select().like('name', 'A%')
    expect((data as TestRow[]).map(r => r.name)).toEqual(['Alice'])
  })

  it('filters with ilike (case-insensitive)', async () => {
    const { data } = await new MockQueryBuilder(TABLE).select().ilike('name', 'al%')
    expect((data as TestRow[]).map(r => r.name)).toEqual(['Alice'])
  })

  it('filters with gte', async () => {
    const { data } = await new MockQueryBuilder(TABLE).select().gte('age', 30)
    expect((data as TestRow[]).map(r => r.name).sort()).toEqual(['Alice', 'Carol'])
  })

  it('filters with lte', async () => {
    const { data } = await new MockQueryBuilder(TABLE).select().lte('age', 25)
    expect((data as TestRow[]).map(r => r.name)).toEqual(['Bob'])
  })
})

describe('ordering and limit', () => {
  it('orders ascending by name by default', async () => {
    const { data } = await new MockQueryBuilder(TABLE).select().order('name')
    expect((data as TestRow[]).map(r => r.name)).toEqual(['Alice', 'Bob', 'Carol'])
  })

  it('orders descending when ascending:false', async () => {
    const { data } = await new MockQueryBuilder(TABLE).select().order('name', { ascending: false })
    expect((data as TestRow[]).map(r => r.name)).toEqual(['Carol', 'Bob', 'Alice'])
  })

  it('limits results', async () => {
    const { data } = await new MockQueryBuilder(TABLE).select().limit(1)
    expect((data as TestRow[]).length).toBe(1)
  })
})

describe('single / maybeSingle', () => {
  it('single returns the row when exactly one match', async () => {
    const { data, error } = await new MockQueryBuilder(TABLE).select().eq('id', '1').single()
    expect(error).toBeNull()
    expect((data as TestRow).name).toBe('Alice')
  })

  it('single returns PGRST116 when no rows match', async () => {
    const { data, error } = await new MockQueryBuilder(TABLE).select().eq('id', 'nonexistent').single()
    expect(data).toBeNull()
    expect((error as { code: string }).code).toBe('PGRST116')
  })

  it('maybeSingle returns null when no rows match', async () => {
    const { data, error } = await new MockQueryBuilder(TABLE).select().eq('id', 'nonexistent').maybeSingle()
    expect(data).toBeNull()
    expect(error).toBeNull()
  })
})

describe('count / head', () => {
  it('returns count with head:true', async () => {
    const { data, count } = await new MockQueryBuilder(TABLE).select('*', { count: 'exact', head: true })
    expect(data).toBeNull()
    expect(count).toBe(3)
  })

  it('count respects filters', async () => {
    const { count } = await new MockQueryBuilder(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    expect(count).toBe(2)
  })
})

describe('insert', () => {
  it('inserts a row and returns nothing by default', async () => {
    const { data, error } = await new MockQueryBuilder(TABLE).insert({ name: 'Dave', age: 28, status: 'active' })
    expect(error).toBeNull()
    expect(data).toBeNull()
    const all = MOCK_STORE[TABLE] as TestRow[]
    expect(all.find(r => r.name === 'Dave')).toBeDefined()
  })

  it('insert().select().single() returns the inserted row', async () => {
    const { data, error } = await new MockQueryBuilder(TABLE)
      .insert({ name: 'Eve', age: 22, status: 'active' })
      .select()
      .single()
    expect(error).toBeNull()
    expect((data as TestRow).name).toBe('Eve')
    expect((data as TestRow).id).toBeDefined()
  })

  it('auto-assigns id and created_at if not provided', async () => {
    await new MockQueryBuilder(TABLE).insert({ name: 'Frank', age: 40, status: 'active' })
    const row = (MOCK_STORE[TABLE] as TestRow[]).find(r => r.name === 'Frank')!
    expect(row.id).toBeDefined()
  })
})

describe('update', () => {
  it('updates matching rows', async () => {
    const { error } = await new MockQueryBuilder(TABLE).update({ status: 'archived' }).eq('status', 'active')
    expect(error).toBeNull()
    const rows = MOCK_STORE[TABLE] as TestRow[]
    expect(rows.filter(r => r.status === 'archived').length).toBe(2)
  })

  it('update().select() returns updated rows', async () => {
    const { data } = await new MockQueryBuilder(TABLE)
      .update({ status: 'vip' })
      .eq('id', '2')
      .select()
    expect((data as TestRow[]).length).toBe(1)
    expect((data as TestRow[])[0].status).toBe('vip')
  })
})

describe('delete', () => {
  it('removes matching rows from the store', async () => {
    await new MockQueryBuilder(TABLE).delete().eq('id', '2')
    const rows = MOCK_STORE[TABLE] as TestRow[]
    expect(rows.length).toBe(2)
    expect(rows.find(r => r.id === '2')).toBeUndefined()
  })
})

describe('upsert', () => {
  it('updates existing row on conflict', async () => {
    await new MockQueryBuilder(TABLE).upsert({ id: '1', name: 'Alice Updated', age: 31, status: 'active' }, { onConflict: 'id' })
    const row = (MOCK_STORE[TABLE] as TestRow[]).find(r => r.id === '1')!
    expect(row.name).toBe('Alice Updated')
    expect(MOCK_STORE[TABLE].length).toBe(3)
  })

  it('inserts new row when no conflict found', async () => {
    await new MockQueryBuilder(TABLE).upsert({ id: '99', name: 'New', age: 99, status: 'active' }, { onConflict: 'id' })
    expect(MOCK_STORE[TABLE].length).toBe(4)
  })
})
