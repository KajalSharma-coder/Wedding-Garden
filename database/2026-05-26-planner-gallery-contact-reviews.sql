CREATE TABLE IF NOT EXISTS quick_planner_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  mobile VARCHAR(24) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  guest_count INT NULL,
  budget VARCHAR(120) NULL,
  city VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  mobile VARCHAR(24) NOT NULL,
  email VARCHAR(180) NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS service_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL,
  booking_id INT NOT NULL,
  customer_name VARCHAR(140) NOT NULL,
  rating TINYINT NOT NULL DEFAULT 5,
  review TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY service_reviews_booking_unique (booking_id),
  INDEX service_reviews_service_idx (service_id),
  CONSTRAINT service_reviews_service_fk FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  CONSTRAINT service_reviews_booking_fk FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS gallery_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY gallery_categories_slug_unique (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS gallery_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  service_id INT NULL,
  title VARCHAR(180) NULL,
  image_url VARCHAR(255) NOT NULL,
  alt_text VARCHAR(180) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX gallery_images_category_idx (category_id),
  INDEX gallery_images_service_idx (service_id),
  CONSTRAINT gallery_images_category_fk FOREIGN KEY (category_id) REFERENCES gallery_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS service_id INT NULL;

INSERT INTO services
  (slug, service_name, category, price, description, features, capacity, location, availability, contact_details, whatsapp_number, status, approved_at)
VALUES
  ('dummy-royal-palace-lawn', 'Royal Palace Lawn', 'Gardens', '275000', 'A premium Jaipur lawn for weddings, receptions and grand family celebrations.', JSON_ARRAY('Palace entry', 'Parking support', 'Bridal room', 'Outdoor lawn'), '500-1200 guests', 'Ajmer Road, Jaipur', 'Available for selected dates', '+91 98765 43210', '919876543210', 'approved', NOW()),
  ('dummy-amber-grand-garden', 'Amber Grand Garden', 'Gardens', '225000', 'A refined garden venue with flexible layouts, stage zones and guest hospitality support.', JSON_ARRAY('Mandap zone', 'Lighting support', 'Catering bay', 'Family rooms'), '300-900 guests', 'Vaishali Nagar, Jaipur', 'Available on request', '+91 98765 43210', '919876543210', 'approved', NOW()),
  ('dummy-lotus-celebration-greens', 'Lotus Celebration Greens', 'Gardens', '185000', 'A polished venue for engagement, reception, haldi, mehendi and intimate wedding functions.', JSON_ARRAY('Photo corners', 'Indoor support', 'Managed parking', 'Decor support'), '150-650 guests', 'Malviya Nagar, Jaipur', 'Good weekday availability', '+91 98765 43210', '919876543210', 'approved', NOW())
ON DUPLICATE KEY UPDATE service_name = VALUES(service_name), category = VALUES(category), status = 'approved';

INSERT INTO gallery_categories (name, slug, sort_order)
VALUES
  ('Wedding Gallery', 'wedding-gallery', 10),
  ('Reception Gallery', 'reception-gallery', 20),
  ('Engagement Gallery', 'engagement-gallery', 30),
  ('Haldi Gallery', 'haldi-gallery', 40),
  ('Mehendi Gallery', 'mehendi-gallery', 50),
  ('Corporate Event Gallery', 'corporate-event-gallery', 60),
  ('Birthday Event Gallery', 'birthday-event-gallery', 70)
ON DUPLICATE KEY UPDATE name = VALUES(name), sort_order = VALUES(sort_order), status = 'active';
