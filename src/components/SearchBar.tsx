'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export default function SearchBar() {
  const { searchQuery, setSearchQuery, setView } = useAppStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)

  const handleSearch = useCallback(() => {
    if (localQuery.trim()) {
      setSearchQuery(localQuery.trim())
      setView('search')
    }
  }, [localQuery, setSearchQuery, setView])

  const handleClear = useCallback(() => {
    setLocalQuery('')
    setSearchQuery('')
  }, [setSearchQuery])

  return (
    <div className="relative flex items-center gap-2 w-full max-w-xl mx-auto">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search MCQs..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch()
          }}
          className="pl-10 pr-10 h-11 bg-white border-gray-200 focus:border-[#007540] focus:ring-[#007540]/20"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <Button
        onClick={handleSearch}
        className="bg-[#007540] hover:bg-[#005c32] text-white h-11 px-5"
      >
        <Search className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </div>
  )
}
