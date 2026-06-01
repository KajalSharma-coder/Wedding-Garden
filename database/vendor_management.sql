CREATE DATABASE IF NOT EXISTS booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking;

CREATE TABLE IF NOT EXISTS admins (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin','admin','manager') NOT NULL DEFAULT 'admin',
  status ENUM('active','suspended') NOT NULL DEFAULT 'active',
  last_login_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NULL,
  phone VARCHAR(24) NOT NULL,
  password_hash VARCHAR(255) NULL,
  status ENUM('active','blocked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY users_email_unique (email),
  KEY users_phone_idx (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vendors (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(140) NOT NULL,
  business_name VARCHAR(180) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  phone VARCHAR(24) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  category ENUM('Gardens','Decoration','DJ Band','Makeup Artists','Pandit Ji','Anchor','Caterers','Car & Bus','Photography','Mehendi Artists') NOT NULL,
  city VARCHAR(120) NOT NULL,
  experience VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  profile_image VARCHAR(255) NULL,
  social_links JSON NULL,
  remember_token VARCHAR(120) NULL,
  status ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  last_login_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY vendors_status_idx (status),
  KEY vendors_category_idx (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vendor_documents (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  vendor_id BIGINT UNSIGNED NOT NULL,
  document_type VARCHAR(80) NOT NULL DEFAULT 'ID Proof',
  file_path VARCHAR(255) NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vendor_services (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  vendor_id BIGINT UNSIGNED NOT NULL,
  service_name VARCHAR(180) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  category ENUM('Gardens','Decoration','DJ Band','Makeup Artists','Pandit Ji','Anchor','Caterers','Car & Bus','Photography','Mehendi Artists') NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  features JSON NULL,
  capacity VARCHAR(120) NULL,
  location VARCHAR(180) NOT NULL,
  availability VARCHAR(180) NOT NULL,
  contact_details VARCHAR(220) NOT NULL,
  whatsapp_number VARCHAR(24) NOT NULL,
  video_url VARCHAR(255) NULL,
  status ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  rejection_reason TEXT NULL,
  approved_by BIGINT UNSIGNED NULL,
  approved_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES admins(id) ON DELETE SET NULL,
  KEY vendor_services_status_idx (status),
  KEY vendor_services_category_idx (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS service_images (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  service_id BIGINT UNSIGNED NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  alt_text VARCHAR(180) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES vendor_services(id) ON DELETE CASCADE,
  KEY service_images_service_order_idx (service_id, is_featured, sort_order),
  UNIQUE KEY service_images_unique_file (service_id, file_path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vendor_inquiries (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  vendor_id BIGINT UNSIGNED NOT NULL,
  service_id BIGINT UNSIGNED NULL,
  name VARCHAR(140) NOT NULL,
  mobile VARCHAR(24) NOT NULL,
  event_date DATE NULL,
  message TEXT NULL,
  status ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES vendor_services(id) ON DELETE SET NULL,
  KEY vendor_inquiries_vendor_idx (vendor_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS service_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id BIGINT UNSIGNED NOT NULL,
  available_date DATE NOT NULL,
  status ENUM('available','blocked','booked') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES vendor_services(id) ON DELETE CASCADE,
  UNIQUE KEY service_availability_unique_date (service_id, available_date),
  KEY service_availability_status_idx (service_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  vendor_id BIGINT UNSIGNED NULL,
  service_id BIGINT UNSIGNED NULL,
  customer_name VARCHAR(140) NOT NULL,
  customer_email VARCHAR(180) NULL,
  customer_phone VARCHAR(24) NOT NULL,
  event_date DATE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  guest_count INT NULL,
  message TEXT NULL,
  amount DECIMAL(12,2) NULL,
  status ENUM('pending','accepted','completed','cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
  FOREIGN KEY (service_id) REFERENCES vendor_services(id) ON DELETE SET NULL,
  KEY bookings_status_idx (status),
  KEY bookings_vendor_idx (vendor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  vendor_id BIGINT UNSIGNED NULL,
  service_id BIGINT UNSIGNED NULL,
  reviewer_name VARCHAR(140) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES vendor_services(id) ON DELETE CASCADE,
  CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  recipient_type ENUM('admin','vendor','user') NOT NULL,
  recipient_id BIGINT UNSIGNED NULL,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255) NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY notifications_recipient_idx (recipient_type, recipient_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  vendor_id BIGINT UNSIGNED NULL,
  amount DECIMAL(12,2) NOT NULL,
  gateway VARCHAR(80) NOT NULL DEFAULT 'manual',
  transaction_id VARCHAR(180) NULL,
  status ENUM('created','paid','failed','refunded') NOT NULL DEFAULT 'created',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contacts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(140) NOT NULL,
  email VARCHAR(180) NULL,
  phone VARCHAR(24) NULL,
  subject VARCHAR(180) NULL,
  message TEXT NOT NULL,
  source VARCHAR(80) NOT NULL DEFAULT 'website',
  status ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create your first admin through the Node API bootstrap or with bcrypt.
-- Then insert it:
-- INSERT INTO admins (name,email,password_hash,role) VALUES ('Royal Admin','admin@royalvivah.local','<hash>','super_admin');
