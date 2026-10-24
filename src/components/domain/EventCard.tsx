import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users } from 'lucide-react'
import type { Event } from '../../types/event.ts'
import { Badge } from '../common/Badge.tsx'
import { ProgressBar } from '../common/ProgressBar.tsx'
import { Button } from '../common/Button.tsx'

export interface EventCardProps {
  event: Event
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const lowestPrice = event.ticketTiers.reduce(
    (min, tier) => (tier.price < min ? tier.price : min),
    event.ticketTiers[0]?.price ?? 0
  )

  const formattedDate = new Date(event.startDate).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const getCategoryColor = (): 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint' => {
    switch (event.category) {
      case 'festival':
        return 'pink'
      case 'competition':
        return 'yellow'
      case 'workshop':
        return 'cyan'
      case 'seminar':
        return 'purple'
      default:
        return 'mint'
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#121215] transition-all overflow-hidden group">
      {/* Banner image with Memphis frame */}
      <div className="relative h-[180px] overflow-hidden border-b-2 border-[#121215] bg-[#FFF585]">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Category Pill Tag */}
        <div className="absolute top-2.5 left-2.5">
          <Badge variant={getCategoryColor()} tilt="left">
            {event.category}
          </Badge>
        </div>

        {/* Location Type Tag */}
        <div className="absolute top-2.5 right-2.5">
          <Badge variant="dark" className="uppercase text-[11px]">
            {event.location.type}
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col grow">
        {/* Organizer & Campus */}
        <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-500 mb-1">
          <span>{event.organizationName}</span>
          <span className="text-[#FF4B91] font-black">{event.university}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-['Space_Grotesk',sans-serif] font-black leading-snug mb-2 text-[#121215]">
          <Link to={`/events/${event.id}`} className="no-underline text-inherit hover:text-[#FF4B91] transition-colors">
            {event.title}
          </Link>
        </h3>

        {/* Short description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 grow leading-relaxed">
          {event.shortDescription}
        </p>

        {/* Meta details */}
        <div className="flex flex-col gap-1.5 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-[#121215] font-semibold">
            <Calendar size={15} className="text-[#FF4B91] shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <MapPin size={15} className="text-[#01CDFE] shrink-0" />
            <span className="truncate">
              {event.location.venueName ? `${event.location.venueName}, ${event.location.city || ''}` : 'Online Event'}
            </span>
          </div>
        </div>

        {/* Capacity Quota Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-bold mb-1 text-gray-700">
            <span className="flex items-center gap-1">
              <Users size={12} /> Terisi
            </span>
            <span>
              {event.attendeeCount} / {event.totalCapacity} Peserta
            </span>
          </div>
          <ProgressBar
            value={event.attendeeCount}
            max={event.totalCapacity}
            color={getCategoryColor()}
            striped
            showPercentage={false}
            height={10}
          />
        </div>

        {/* Price & Action Button Footer */}
        <div className="flex items-center justify-between border-t-2 border-dashed border-gray-200 pt-3.5 mt-auto">
          <div>
            <span className="block text-[11px] text-gray-500 uppercase font-bold tracking-wider">
              Mulai Dari
            </span>
            <span className="font-['Space_Grotesk',sans-serif] font-black text-base text-[#121215]">
              {lowestPrice === 0 ? 'GRATIS' : `Rp ${lowestPrice.toLocaleString('id-ID')}`}
            </span>
          </div>

          <Link to={`/events/${event.id}`} className="no-underline">
            <Button variant={lowestPrice === 0 ? 'mint' : 'yellow'} size="sm">
              Detail Tiket →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
