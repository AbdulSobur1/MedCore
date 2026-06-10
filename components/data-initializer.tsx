'use client'

import { useEffect } from 'react'
import { seedInitialData } from '@/lib/store'

export function DataInitializer() {
  useEffect(() => {
    seedInitialData()
  }, [])

  return null
}
