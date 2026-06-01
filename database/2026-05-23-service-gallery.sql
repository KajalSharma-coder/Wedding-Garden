USE booking;

ALTER TABLE service_images
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE AFTER sort_order,
  ADD INDEX IF NOT EXISTS service_images_service_order_idx (service_id, is_featured, sort_order);

UPDATE service_images i
JOIN (
  SELECT service_id, MIN(sort_order) first_sort
  FROM service_images
  GROUP BY service_id
) first_image ON first_image.service_id = i.service_id AND first_image.first_sort = i.sort_order
SET i.is_featured = TRUE
WHERE i.is_featured = FALSE;

