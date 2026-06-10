import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: LucideIcon
  color?: 'teal' | 'emerald' | 'rose' | 'amber' | 'sky'
}

const colorMap = {
  teal: 'bg-[--accent]',
  emerald: 'bg-[--success]',
  rose: 'bg-[--danger]',
  amber: 'bg-[--warning]',
  sky: 'bg-[--info]',
}

export function StatCard({ title, value, change, icon: Icon, color = 'teal' }: StatCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="label mb-1">{title}</p>
          <p className="text-[24px] font-semibold text-[--text-1]">{value}</p>
          {change && <p className="caption mt-1.5">{change}</p>}
        </div>
        <div className={`w-9 h-9 rounded-lg ${colorMap[color]} flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  )
}
