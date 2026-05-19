import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useEntries(year, month) {
  const { user } = useAuth()
  const [entries, setEntries] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const from = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const to   = `${year}-${String(month + 1).padStart(2, '0')}-31`
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', from)
      .lte('date', to)
    if (!error && data) {
      const map = {}
      data.forEach(e => { map[e.date] = e })
      setEntries(map)
    }
    setLoading(false)
  }, [user, year, month])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const saveEntry = async (date, payload) => {
    if (!user) return { error: 'No autenticado' }
    const record = { ...payload, date, user_id: user.id }
    const { data, error } = await supabase
      .from('entries')
      .upsert(record, { onConflict: 'user_id,date' })
      .select()
      .single()
    if (!error && data) {
      setEntries(prev => ({ ...prev, [date]: data }))
    }
    return { data, error }
  }

  const deleteEntry = async (date) => {
    if (!user) return { error: 'No autenticado' }
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date)
    if (!error) {
      setEntries(prev => {
        const next = { ...prev }
        delete next[date]
        return next
      })
    }
    return { error }
  }

  return { entries, loading, saveEntry, deleteEntry, refetch: fetchEntries }
}
