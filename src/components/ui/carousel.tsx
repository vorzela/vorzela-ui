import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import * as React from 'react'

import { useReducedMotion } from '~/hooks/use-reduced-motion'
import { cx } from '~/lib/cx'
import { Button } from './button'
import styles from './carousel.module.scss'

export interface CarouselSlide {
  id: string
  content: React.ReactNode
  alt?: string
}

export interface CarouselProps {
  slides: CarouselSlide[]
  label?: string
  autoPlay?: boolean
  interval?: number
  loop?: boolean
  className?: string
}

/** Scroll-snap carousel with arrows, dots, and optional autoplay. */
export function Carousel({
  slides,
  label = 'Carousel',
  autoPlay = false,
  interval = 5000,
  loop = true,
  className,
}: CarouselProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [index, setIndex] = React.useState(0)
  const [hovered, setHovered] = React.useState(false)
  const [userPaused, setUserPaused] = React.useState(false)
  const paused = hovered || userPaused
  const reduced = useReducedMotion()
  const atStart = index === 0
  const atEnd = index === slides.length - 1

  const goTo = React.useCallback(
    (next: number) => {
      if (slides.length === 0) return

      const bounded = loop
        ? ((next % slides.length) + slides.length) % slides.length
        : Math.max(0, Math.min(next, slides.length - 1))

      setIndex(bounded)
      const track = trackRef.current
      if (track) {
        track.scrollTo({
          left: bounded * track.clientWidth,
          behavior: reduced ? 'auto' : 'smooth',
        })
      }
    },
    [loop, reduced, slides.length],
  )

  React.useEffect(() => {
    if (!autoPlay || paused || reduced || slides.length < 2) return

    const timer = window.setInterval(() => {
      const track = trackRef.current
      if (!track) return
      const current = Math.round(
        track.scrollLeft / Math.max(1, track.clientWidth),
      )
      goTo(current + 1)
    }, interval)

    return () => window.clearInterval(timer)
  }, [autoPlay, goTo, interval, paused, reduced, slides.length])

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={cx(styles.root, className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <div
        ref={trackRef}
        className={styles.track}
        onScroll={(event) => {
          const track = event.currentTarget
          const next = Math.round(
            track.scrollLeft / Math.max(1, track.clientWidth),
          )
          if (next !== index) setIndex(next)
        }}
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIndex + 1} of ${slides.length}`}
            className={styles.slide}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {autoPlay && slides.length > 1 ? (
        <Button
          variant="outline"
          size="icon"
          className={cx(styles.control, styles.pause)}
          onClick={() => setUserPaused((value) => !value)}
          aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
          aria-pressed={userPaused}
        >
          {userPaused ? (
            <Play aria-hidden />
          ) : (
            <Pause aria-hidden />
          )}
        </Button>
      ) : null}

      {slides.length > 1 ? (
        <>
          <Button
            variant="outline"
            size="icon"
            className={cx(styles.control, styles.previous)}
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            disabled={!loop && atStart}
          >
            <ChevronLeft aria-hidden />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cx(styles.control, styles.next)}
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            disabled={!loop && atEnd}
          >
            <ChevronRight aria-hidden />
          </Button>

          <div className={styles.dots}>
            {slides.length > 4 ? (
              <div
                role="progressbar"
                aria-label={`Slide ${index + 1} of ${slides.length}`}
                aria-valuemin={1}
                aria-valuemax={slides.length}
                aria-valuenow={index + 1}
                className={styles.progress}
              >
                <span className={styles.progressTrack}>
                  <span
                    className={styles.progressFill}
                    style={{ width: `${((index + 1) / slides.length) * 100}%` }}
                  />
                </span>
                <span className={styles.progressCount}>
                  {index + 1} / {slides.length}
                </span>
              </div>
            ) : (
              slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  className={styles.dot}
                  onClick={() => goTo(slideIndex)}
                  aria-label={`Go to slide ${slideIndex + 1}`}
                  aria-current={slideIndex === index}
                />
              ))
            )}
          </div>
        </>
      ) : null}
    </section>
  )
}
