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
  const ticketTiers = event.ticketTiers ?? []
  const lowestPrice = ticketTiers.length > 0
    ? ticketTiers.reduce(
        (min, tier) => (tier.price < min ? tier.price : min),
        ticketTiers[0].price
      )
    : 0

  const formattedDate = new Date(event.startDate).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col h-full bg-[#151515] border border-[#3D3D3D]/60 rounded-xl hover:border-[#CFFE06]/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-200 overflow-hidden group">
      {/* Banner image with dark overlay */}
      <div className="relative h-[190px] overflow-hidden bg-[#202020]">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-black/30" />

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3">
          <Badge variant="accent">
            {event.category}
          </Badge>
        </div>

        {/* Location Type Tag */}
        <div className="absolute top-3 right-3">
          <Badge variant="dark" className="uppercase text-[11px]">
            {event.location.type}
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col grow">
        {/* Organizer & Campus */}
        <div className="flex items-center justify-between text-xs font-semibold text-[#9C9C9C] mb-1.5">
          <span className="truncate">{event.organizationName}</span>
          <span className="text-[#CFFE06] font-bold shrink-0 ml-2">{event.university}</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-['Montserrat',sans-serif] font-bold leading-snug mb-2 text-white line-clamp-2">
          <Link to={`/events/${event.id}`} className="no-underline text-inherit hover:text-[#CFFE06] transition-colors">
            {event.title}
          </Link>
        </h3>

        {/* Short description */}
        <p className="text-xs text-[#9C9C9C] mb-4 line-clamp-2 grow leading-relaxed">
          {event.shortDescription}
        </p>

        {/* Meta details */}
        <div className="flex flex-col gap-1.5 mb-4 text-xs">
          <div className="flex items-center gap-2 text-[#9C9C9C]">
            <Calendar size={14} className="text-[#CFFE06] shrink-0" />
            <span className="text-white font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-[#9C9C9C]">
            <MapPin size={14} className="text-[#CFFE06] shrink-0" />
            <span className="truncate">
              {event.location.venueName ? `${event.location.venueName}, ${event.location.city || ''}` : 'Online Event'}
            </span>
          </div>
        </div>

        {/* Capacity Quota Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-medium mb-1.5 text-[#9C9C9C]">
            <span className="flex items-center gap-1">
              <Users size={12} className="text-[#CFFE06]" /> Terisi
            </span>
            <span>
              {event.attendeeCount} / {event.totalCapacity}
            </span>
          </div>
          <ProgressBar
            value={event.attendeeCount}
            max={event.totalCapacity}
            color="accent"
            showPercentage={false}
            height={6}
          />
        </div>

        {/* Price & Action Button Footer */}
        <div className="flex items-center justify-between border-t border-[#3D3D3D]/50 pt-3.5 mt-auto">
          <div>
            <span className="block text-[11px] text-[#9C9C9C] uppercase font-medium">
              Mulai Dari
            </span>
            <span className="font-['Montserrat',sans-serif] font-bold text-base text-white">
              {lowestPrice === 0 ? (
                <span className="text-[#CFFE06]">GRATIS</span>
              ) : (
                `Rp ${lowestPrice.toLocaleString('id-ID')}`
              )}
            </span>
          </div>

          <Link to={`/events/${event.id}`} className="no-underline">
            <Button variant="accent" size="sm">
              Detail Tiket
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
