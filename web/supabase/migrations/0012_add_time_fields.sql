ALTER TABLE seminars ADD COLUMN start_time TIME;
ALTER TABLE seminars ADD COLUMN end_time TIME;

ALTER TABLE reverse_offer_events ADD COLUMN start_time TIME;
ALTER TABLE reverse_offer_events ADD COLUMN end_time TIME;

ALTER TABLE ca_meetings ADD COLUMN start_time TIME;
ALTER TABLE ca_meetings ADD COLUMN end_time TIME;
