# Royal Vivah Gardens Image Mapping Report

## Hero Carousel
- Royal Palace Wedding Setup -> `luxuryWeddingImages.hero.palaceWedding`
- Luxury Wedding Garden Night View -> `luxuryWeddingImages.hero.gardenNight`
- Premium Wedding Decoration -> `luxuryWeddingImages.hero.premiumDecor`
- Destination Wedding Resort -> `luxuryWeddingImages.hero.destinationResort`
- Grand Wedding Stage Setup -> `luxuryWeddingImages.hero.grandStage`
- Luxury Catering Experience -> `luxuryWeddingImages.hero.cateringExperience`
- Bridal Entry Setup -> `luxuryWeddingImages.hero.bridalEntry`
- Premium Reception Setup -> `luxuryWeddingImages.hero.receptionSetup`

## Service Cards
- Gardens -> luxury wedding garden fallback
- Decoration -> premium floral decoration fallback
- Photography -> professional wedding photographer fallback
- Caterers -> luxury catering buffet fallback
- Makeup Artists -> bridal makeup artist fallback
- Mehendi Artists -> bridal mehendi closeup fallback
- DJ Band -> wedding DJ stage fallback
- Anchor -> professional event host fallback
- Car & Bus -> luxury wedding transportation fallback
- Pandit Ji -> traditional wedding rituals fallback

## Featured Venues
- Rajwada Palace Lawn -> Royal Palace
- Amrit Mahal Garden -> Luxury Garden
- Maharani Courtyard -> Modern Banquet Hall
- Udaipur Resort Greens -> Destination Resort

## Events
- Wedding, Destination Wedding, Corporate Events, Reception, Engagement, Haldi, Mehendi, Birthday, Anniversary, Resorts, Banquet Halls and Baby Shower now use unique category-matched imagery.

## Gallery Preview
- Wedding Stage
- Couple Entry
- Bridal Portrait
- Mehendi Ceremony
- Haldi Ceremony
- Reception Setup
- Catering Area
- Fireworks Celebration
- Family Photos
- Luxury Decoration

## Optimization Summary
- Centralized deterministic image roles in `lib/real-images.ts`.
- Removed dynamic `source.unsplash.com` image selection in favor of stable, unique curated URLs.
- Added category-aware fallback images through `fallbackImage()`.
- Updated `LocalMedia` to use `next/image`, lazy loading, alt-driven fallback selection and optimized rendering for supported remote sources.
- Converted vendor dashboard persisted thumbnails from raw `img` tags to `LocalMedia`/`next/image` where possible.
- Left local blob preview `img` tags in the upload form because those are client-created object URLs.
