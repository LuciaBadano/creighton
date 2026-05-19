import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// Trae TODOS los registros entre dos fechas (para la vista por ciclo)
export function useEntriesRange(fromDate, toDate) {
  const { user } = useAuth()
  const [entries, setEntries] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    if (!user || !fromDate || !toDate) return
    setLoading(true)
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', fromDate)
      .lte('date', toDate)
      .order('date', { ascending: true })
    if (!error && data) {
      const map = {}
      data.forEach(e => { map[e.date] = e })
      setEntries(map)
    }
    setLoading(false)
  }, [user, fromDate, toDate])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  return { entries, loading, refetch: fetchEntries }
}

// Trae todos los registros menstruales para detectar inicios de ciclo
export function useAllMenstrualDates() {
  const { user } = useAuth()
  const [menstrualDates, setMenstrualDates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from('entries')
        .select('date, day_type')
        .eq('user_id', user.id)
        .in('day_type', ['menstrual'])
        .order('date', { ascending: true })
      if (!error && data) {
        // Detecta el primer día de cada grupo de menstruación consecutiva
        const starts = []
        let prev = null
        for (const row of data) {
          const curr = new Date(row.date + 'T12:00:00')
          if (!prev) {
            starts.push(row.date)
          } else {
            const diff = (curr - prev) / (1000 * 60 * 60 * 24)
            if (diff > 1) starts.push(row.date) // nuevo grupo = nuevo ciclo
          }
          prev = curr
        }
        setMenstrualDates(starts)
      }
      setLoading(false)
    }
    fetch()
  }, [user])

  return { menstrualDates, loading }
}
