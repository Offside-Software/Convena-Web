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
    <div
      className="memphis-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Banner image with Memphis frame */}
      <div
        style={{
          position: 'relative',
          height: '180px',
          overflow: 'hidden',
          borderBottom: 'var(--mem-border)',
          backgroundColor: 'var(--mem-yellow-light)',
        }}
      >
        <img
          src={event.bannerUrl}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        />

        {/* Category Pill Tag */}
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <Badge variant={getCategoryColor()} tilt="left">
            {event.category}
          </Badge>
        </div>

        {/* Location Type Tag */}
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <Badge variant="dark" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
            {event.location.type}
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Organizer & Campus */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--mem-gray-500)',
            marginBottom: '0.4rem',
          }}
        >
          <span>{event.organizationName}</span>
          <span style={{ color: 'var(--mem-pink)', fontWeight: 800 }}>{event.university}</span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.15rem',
            lineHeight: 1.3,
            marginBottom: '0.5rem',
            color: 'var(--mem-dark)',
          }}
        >
          <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {event.title}
          </Link>
        </h3>

        {/* Short description */}
        <p
          style={{
            fontSize: '0.875rem',
            color: '#4B5563',
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flexGrow: 1,
          }}
        >
          {event.shortDescription}
        </p>

        {/* Meta details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem', fontSize: '0.825rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--mem-dark)', fontWeight: 600 }}>
            <Calendar size={15} style={{ color: 'var(--mem-pink)' }} />
            <span>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--mem-gray-500)' }}>
            <MapPin size={15} style={{ color: 'var(--mem-cyan)' }} />
            <span>
              {event.location.venueName ? `${event.location.venueName}, ${event.location.city || ''}` : 'Online Event'}
            </span>
          </div>
        </div>

        {/* Capacity Quota Progress */}
        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '2px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px dashed var(--mem-gray-200)',
            paddingTop: '0.85rem',
            marginTop: 'auto',
          }}
        >
          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--mem-gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Mulai Dari
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', color: 'var(--mem-dark)' }}>
              {lowestPrice === 0 ? 'GRATIS' : `Rp ${lowestPrice.toLocaleString('id-ID')}`}
            </span>
          </div>

          <Link to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
            <Button variant={lowestPrice === 0 ? 'mint' : 'yellow'} size="sm">
              Detail Tiket →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
