-- Royal BNF multi-item food orders, version 2.
-- TEST-COPY SCRIPT ONLY: this copy is deliberately pinned to
-- royal_bnf_restore_test. Do not change the USE target or run against the live
-- royal_bnf database before review and a separately approved live runbook.
-- This is manual SQL; the application does not execute it automatically.

USE `royal_bnf_restore_test`;

-- Read-only preflight output. The guard below repeats critical checks and
-- aborts on unexpected counts, relationships, child data, or schema.
SELECT DATABASE() AS migration_target;
SELECT COUNT(*) AS food_order_count,
       MIN(id) AS first_order_id,
       MAX(id) AS last_order_id
FROM food_orders;
SELECT COUNT(*) AS food_order_item_count FROM food_order_items;
SELECT 'hotels' AS table_name, COUNT(*) AS row_count FROM hotels
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'hotel_food_menus', COUNT(*) FROM hotel_food_menus
UNION ALL SELECT 'food_items', COUNT(*) FROM food_items;
SELECT table_name, engine
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN (
      'food_orders', 'food_order_items', 'bookings', 'rooms',
      'hotels', 'hotel_food_menus', 'food_items'
  )
ORDER BY table_name;
SELECT table_name, column_name, column_type, is_nullable, column_default, extra
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name IN (
      'food_orders', 'food_order_items', 'bookings', 'rooms',
      'hotels', 'hotel_food_menus', 'food_items'
  )
ORDER BY table_name, ordinal_position;
SELECT table_name, constraint_name, column_name,
       referenced_table_name, referenced_column_name
FROM information_schema.key_column_usage
WHERE table_schema = DATABASE()
  AND table_name IN (
      'food_orders', 'food_order_items', 'bookings', 'rooms',
      'hotel_food_menus', 'food_items'
  )
ORDER BY table_name, constraint_name, ordinal_position;

-- The preflight intentionally reports order rows without printing booking
-- guest data or special instructions. Inspect those order fields locally if
-- needed before execution.
SELECT fo.id, fo.booking_id, fo.hotel_id AS stored_hotel_id,
       r.hotel_id AS booking_hotel_id, hfm.hotel_id AS menu_hotel_id,
       fo.hotel_food_menu_id, fo.quantity, fo.serving_date, fo.status,
       fo.unit_price, fo.total_price, fo.created_at
FROM food_orders fo
JOIN bookings b ON b.id = fo.booking_id
JOIN rooms r ON r.id = b.room_id
JOIN hotel_food_menus hfm ON hfm.id = fo.hotel_food_menu_id
ORDER BY fo.id;

DELIMITER $$
DROP PROCEDURE IF EXISTS assert_royal_bnf_food_order_migration_preflight$$
CREATE PROCEDURE assert_royal_bnf_food_order_migration_preflight()
BEGIN
    DECLARE n BIGINT DEFAULT 0;

    IF DATABASE() <> 'royal_bnf_restore_test' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Migration test is pinned to royal_bnf_restore_test';
    END IF;

    SELECT COUNT(*) INTO n
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name IN (
          'food_orders', 'food_order_items', 'bookings', 'rooms',
          'hotels', 'hotel_food_menus', 'food_items'
      )
      AND engine = 'InnoDB';
    IF n <> 7 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Expected seven required InnoDB tables';
    END IF;

    SELECT COUNT(*) INTO n FROM food_orders;
    IF n <> 5 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Expected exactly five historical food orders';
    END IF;

    SELECT COUNT(*) INTO n FROM hotels;
    IF n <> 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Expected five hotels';
    END IF;
    SELECT COUNT(*) INTO n FROM bookings;
    IF n <> 13 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Expected thirteen bookings';
    END IF;
    SELECT COUNT(*) INTO n FROM hotel_food_menus;
    IF n <> 40 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Expected forty hotel food menus';
    END IF;
    SELECT COUNT(*) INTO n FROM food_items;
    IF n <> 8 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Expected eight food items';
    END IF;

    SELECT COUNT(*) INTO n
    FROM food_orders
    WHERE id BETWEEN 1 AND 5;
    IF n <> 5 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Expected historical food order IDs 1 through 5';
    END IF;

    SELECT COUNT(*) INTO n
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'food_orders'
      AND (
          (column_name = 'id' AND column_type = 'bigint' AND is_nullable = 'NO'
           AND extra = 'auto_increment') OR
          (column_name = 'booking_id' AND column_type = 'bigint' AND is_nullable = 'NO') OR
          (column_name = 'hotel_id' AND column_type = 'bigint' AND is_nullable = 'NO') OR
          (column_name = 'hotel_food_menu_id' AND column_type = 'bigint') OR
          (column_name = 'quantity' AND column_type = 'int') OR
          (column_name = 'serving_date' AND column_type = 'date' AND is_nullable = 'NO') OR
          (column_name = 'special_instructions' AND column_type = 'varchar(500)' AND is_nullable = 'YES') OR
          (column_name = 'status' AND column_type LIKE 'enum(%' AND is_nullable = 'NO') OR
          (column_name = 'unit_price' AND column_type = 'decimal(10,2)') OR
          (column_name = 'total_price' AND column_type = 'decimal(10,2)' AND is_nullable = 'NO') OR
          (column_name = 'created_at' AND column_type = 'datetime(6)' AND is_nullable = 'NO')
      );
    IF n <> 11 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'food_orders schema differs from verified preflight';
    END IF;

    SELECT COUNT(*) INTO n
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'food_order_items'
      AND (
          (column_name = 'id' AND column_type = 'bigint' AND is_nullable = 'NO'
           AND extra = 'auto_increment') OR
          (column_name = 'food_order_id' AND column_type = 'bigint' AND is_nullable = 'NO') OR
          (column_name = 'hotel_food_menu_id' AND column_type = 'bigint' AND is_nullable = 'NO') OR
          (column_name = 'quantity' AND column_type = 'int' AND is_nullable = 'NO') OR
          (column_name = 'unit_price' AND column_type = 'decimal(10,2)' AND is_nullable = 'NO') OR
          (column_name = 'total_price' AND column_type = 'decimal(10,2)' AND is_nullable = 'NO')
      );
    IF n <> 6 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'food_order_items schema differs from verified preflight';
    END IF;

    SELECT COUNT(*) INTO n
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'food_order_items'
      AND index_name = 'PRIMARY'
      AND column_name = 'id'
      AND seq_in_index = 1
      AND non_unique = 0;
    IF n <> 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'food_order_items primary key differs from verified schema';
    END IF;

    SELECT COUNT(DISTINCT column_name) INTO n
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'food_order_items'
      AND seq_in_index = 1
      AND column_name IN ('id', 'food_order_id', 'hotel_food_menu_id');
    IF n <> 3 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'food_order_items indexes differ from verified schema';
    END IF;

    -- Confirm all five target parents resolve to the same hotel through both
    -- their booking and menu, and allow only the verified old value (0) or the
    -- already-correct value so a rerun is safe.
    SELECT COUNT(*) INTO n
    FROM food_orders fo
    JOIN bookings b ON b.id = fo.booking_id
    JOIN rooms r ON r.id = b.room_id
    JOIN hotel_food_menus hfm ON hfm.id = fo.hotel_food_menu_id
    JOIN hotels h ON h.id = r.hotel_id
    WHERE fo.id BETWEEN 1 AND 5
      AND (r.hotel_id <> hfm.hotel_id
           OR fo.hotel_id NOT IN (0, r.hotel_id)
           OR r.hotel_id <> CASE fo.id
               WHEN 1 THEN 2 WHEN 2 THEN 1 WHEN 3 THEN 1
               WHEN 4 THEN 2 WHEN 5 THEN 2 END);
    IF n <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Booking/menu hotel mismatch or unexpected parent hotel_id';
    END IF;

    SELECT COUNT(*) INTO n
    FROM food_orders fo
    LEFT JOIN bookings b ON b.id = fo.booking_id
    LEFT JOIN rooms r ON r.id = b.room_id
    LEFT JOIN hotels h ON h.id = r.hotel_id
    LEFT JOIN hotel_food_menus hfm ON hfm.id = fo.hotel_food_menu_id
    LEFT JOIN food_items fi ON fi.id = hfm.food_item_id
    WHERE fo.id BETWEEN 1 AND 5
      AND (b.id IS NULL OR r.id IS NULL OR h.id IS NULL
           OR hfm.id IS NULL OR fi.id IS NULL);
    IF n <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Orphaned historical booking, room, or menu reference';
    END IF;

    SELECT COUNT(*) INTO n
    FROM food_orders
    WHERE id BETWEEN 1 AND 5
      AND (booking_id IS NULL OR hotel_food_menu_id IS NULL OR quantity IS NULL
           OR serving_date IS NULL OR status IS NULL OR unit_price IS NULL
           OR total_price IS NULL OR created_at IS NULL);
    IF n <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Historical order contains a required NULL value';
    END IF;

    SELECT COUNT(*) INTO n
    FROM food_order_items foi
    LEFT JOIN food_orders fo ON fo.id = foi.food_order_id
    WHERE fo.id IS NULL;
    IF n <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Orphaned child order item exists';
    END IF;

    SELECT COUNT(*) INTO n
    FROM food_order_items
    WHERE food_order_id BETWEEN 1 AND 5;
    IF n > 5 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'More than one child item per historical order exists';
    END IF;

    SELECT COUNT(*) INTO n
    FROM (
        SELECT food_order_id
        FROM food_order_items
        WHERE food_order_id BETWEEN 1 AND 5
        GROUP BY food_order_id
        HAVING COUNT(*) > 1
    ) duplicated_children;
    IF n <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Duplicate child rows exist for a historical order';
    END IF;

    SELECT COUNT(*) INTO n
    FROM food_order_items foi
    JOIN food_orders fo ON fo.id = foi.food_order_id
    WHERE fo.id BETWEEN 1 AND 5
      AND (foi.hotel_food_menu_id <> fo.hotel_food_menu_id
           OR foi.quantity <> fo.quantity
           OR foi.unit_price <> fo.unit_price
           OR foi.total_price <> fo.total_price);
    IF n <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Existing child snapshot differs from its parent';
    END IF;

    SELECT COUNT(*) INTO n
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND (
          (table_name = 'food_orders' AND column_name = 'booking_id'
           AND referenced_table_name = 'bookings' AND referenced_column_name = 'id') OR
          (table_name = 'food_orders' AND column_name = 'hotel_food_menu_id'
           AND referenced_table_name = 'hotel_food_menus' AND referenced_column_name = 'id') OR
          (table_name = 'food_order_items' AND column_name = 'food_order_id'
           AND referenced_table_name = 'food_orders' AND referenced_column_name = 'id') OR
          (table_name = 'food_order_items' AND column_name = 'hotel_food_menu_id'
           AND referenced_table_name = 'hotel_food_menus' AND referenced_column_name = 'id') OR
          (table_name = 'bookings' AND column_name = 'room_id'
           AND referenced_table_name = 'rooms' AND referenced_column_name = 'id') OR
          (table_name = 'rooms' AND column_name = 'hotel_id'
           AND referenced_table_name = 'hotels' AND referenced_column_name = 'id') OR
          (table_name = 'hotel_food_menus' AND column_name = 'hotel_id'
           AND referenced_table_name = 'hotels' AND referenced_column_name = 'id') OR
          (table_name = 'hotel_food_menus' AND column_name = 'food_item_id'
           AND referenced_table_name = 'food_items' AND referenced_column_name = 'id')
      );
    IF n <> 8 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Required order, booking, room, menu, or hotel foreign key is missing';
    END IF;

    SELECT COUNT(*) INTO n
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = 'food_orders'
      AND column_name = 'hotel_id'
      AND referenced_table_name IS NOT NULL
      AND (referenced_table_name <> 'hotels'
           OR referenced_column_name <> 'id');
    IF n <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Unexpected existing foreign key on food_orders.hotel_id';
    END IF;
END$$
CALL assert_royal_bnf_food_order_migration_preflight()$$
DROP PROCEDURE assert_royal_bnf_food_order_migration_preflight$$
DELIMITER ;

-- Capture original parent values in a session-scoped snapshot for postflight.
-- It is recreated on rerun and does not persist historical data in the schema.
DROP TEMPORARY TABLE IF EXISTS royal_bnf_food_order_snapshot;
CREATE TEMPORARY TABLE royal_bnf_food_order_snapshot AS
SELECT id, booking_id, hotel_id, hotel_food_menu_id, quantity, serving_date,
       special_instructions, status, unit_price, total_price, created_at
FROM food_orders
WHERE id BETWEEN 1 AND 5;

-- The existing food_order_items table is validated above and is deliberately
-- neither created nor replaced by this migration.
-- Schema changes (idempotent): relax the legacy single-item NOT NULL
-- requirements needed for future parent orders, retaining columns, historical
-- values, the menu foreign key, and indexes.
-- MySQL ALTER TABLE implicitly commits. These schema changes are deliberately
-- outside the later DML transaction and are rerunnable if execution stops.
-- CREATE/DROP PROCEDURE statements below also implicitly commit in MySQL; they
-- are temporary migration helpers and are not part of the order data change.

DELIMITER $$
DROP PROCEDURE IF EXISTS prepare_royal_bnf_food_order_schema$$
CREATE PROCEDURE prepare_royal_bnf_food_order_schema()
BEGIN
    DECLARE is_nullable_value VARCHAR(3);
    DECLARE has_hotel_index INT DEFAULT 0;

    SELECT is_nullable INTO is_nullable_value
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'food_orders'
      AND column_name = 'hotel_food_menu_id';
    IF is_nullable_value = 'NO' THEN
        ALTER TABLE food_orders
            MODIFY COLUMN hotel_food_menu_id BIGINT NULL;
    END IF;

    SELECT is_nullable INTO is_nullable_value
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'food_orders'
      AND column_name = 'quantity';
    IF is_nullable_value = 'NO' THEN
        ALTER TABLE food_orders MODIFY COLUMN quantity INT NULL;
    END IF;

    SELECT is_nullable INTO is_nullable_value
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'food_orders'
      AND column_name = 'unit_price';
    IF is_nullable_value = 'NO' THEN
        ALTER TABLE food_orders
            MODIFY COLUMN unit_price DECIMAL(10,2) NULL;
    END IF;

    SELECT COUNT(*) INTO has_hotel_index
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'food_orders'
      AND column_name = 'hotel_id'
      AND seq_in_index = 1;
    IF has_hotel_index = 0 THEN
        ALTER TABLE food_orders ADD INDEX idx_food_orders_hotel_id (hotel_id);
    END IF;

END$$
CALL prepare_royal_bnf_food_order_schema()$$
DROP PROCEDURE prepare_royal_bnf_food_order_schema$$
DELIMITER ;

-- Correct only the five verified historical parents. The preflight ensures
-- both independent hotel paths agree before this update is allowed. The DML
-- transaction has an exception handler so either both statements commit or
-- both roll back; historical prices are copied without recalculation.
DELIMITER $$
DROP PROCEDURE IF EXISTS migrate_royal_bnf_food_orders$$
CREATE PROCEDURE migrate_royal_bnf_food_orders()
BEGIN
    DECLARE verified_item_count BIGINT DEFAULT 0;
    DECLARE snapshot_mismatch_count BIGINT DEFAULT 0;
    DECLARE hotel_mismatch_count BIGINT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    UPDATE food_orders fo
    JOIN bookings b ON b.id = fo.booking_id
    JOIN rooms r ON r.id = b.room_id
    JOIN hotel_food_menus hfm ON hfm.id = fo.hotel_food_menu_id
    SET fo.hotel_id = r.hotel_id
    WHERE fo.id BETWEEN 1 AND 5
      AND fo.hotel_id = 0
      AND r.hotel_id = hfm.hotel_id;

    INSERT INTO food_order_items
        (food_order_id, hotel_food_menu_id, quantity, unit_price, total_price)
    SELECT fo.id, fo.hotel_food_menu_id, fo.quantity, fo.unit_price, fo.total_price
    FROM food_orders fo
    WHERE fo.id BETWEEN 1 AND 5
      AND NOT EXISTS (
          SELECT 1
          FROM food_order_items foi
          WHERE foi.food_order_id = fo.id
      );

    SELECT COUNT(*) INTO verified_item_count
    FROM (
        SELECT fo.id
        FROM food_orders fo
        LEFT JOIN food_order_items foi ON foi.food_order_id = fo.id
        WHERE fo.id BETWEEN 1 AND 5
        GROUP BY fo.id
        HAVING COUNT(foi.id) = 1
    ) exactly_one_item;
    IF verified_item_count <> 5 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Transactional validation failed: one child per parent required';
    END IF;

    SELECT COUNT(*) INTO snapshot_mismatch_count
    FROM food_orders fo
    JOIN food_order_items foi ON foi.food_order_id = fo.id
    WHERE fo.id BETWEEN 1 AND 5
      AND (NOT (foi.hotel_food_menu_id <=> fo.hotel_food_menu_id)
           OR NOT (foi.quantity <=> fo.quantity)
           OR NOT (foi.unit_price <=> fo.unit_price)
           OR NOT (foi.total_price <=> fo.total_price));
    IF snapshot_mismatch_count <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Transactional validation failed: item snapshot mismatch';
    END IF;

    SELECT COUNT(*) INTO hotel_mismatch_count
    FROM food_orders fo
    JOIN bookings b ON b.id = fo.booking_id
    JOIN rooms r ON r.id = b.room_id
    JOIN hotel_food_menus hfm ON hfm.id = fo.hotel_food_menu_id
    WHERE fo.id BETWEEN 1 AND 5
      AND (fo.hotel_id <> r.hotel_id
           OR r.hotel_id <> hfm.hotel_id
           OR fo.hotel_id <> CASE fo.id
               WHEN 1 THEN 2 WHEN 2 THEN 1 WHEN 3 THEN 1
               WHEN 4 THEN 2 WHEN 5 THEN 2 END);
    IF hotel_mismatch_count <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Transactional validation failed: corrected hotel mismatch';
    END IF;

    COMMIT;
END$$
CALL migrate_royal_bnf_food_orders()$$
DROP PROCEDURE migrate_royal_bnf_food_orders$$
DELIMITER ;

-- Add referential integrity only after correcting legacy hotel_id=0 values.
-- Existing correct hotel FK constraints are retained without duplication.
DELIMITER $$
DROP PROCEDURE IF EXISTS add_royal_bnf_food_order_hotel_fk$$
CREATE PROCEDURE add_royal_bnf_food_order_hotel_fk()
BEGIN
    DECLARE has_hotel_fk INT DEFAULT 0;
    DECLARE wrong_hotel_fk INT DEFAULT 0;
    SELECT COUNT(*) INTO has_hotel_fk
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = 'food_orders'
      AND column_name = 'hotel_id'
      AND referenced_table_name = 'hotels'
      AND referenced_column_name = 'id';
    SELECT COUNT(*) INTO wrong_hotel_fk
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = 'food_orders'
      AND column_name = 'hotel_id'
      AND referenced_table_name IS NOT NULL
      AND (referenced_table_name <> 'hotels'
           OR referenced_column_name <> 'id');
    IF wrong_hotel_fk <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Unexpected existing foreign key on food_orders.hotel_id';
    END IF;
    IF has_hotel_fk = 0 THEN
        ALTER TABLE food_orders
            ADD CONSTRAINT fk_food_orders_hotel
            FOREIGN KEY (hotel_id) REFERENCES hotels (id);
    END IF;
END$$
CALL add_royal_bnf_food_order_hotel_fk()$$
DROP PROCEDURE add_royal_bnf_food_order_hotel_fk$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS assert_royal_bnf_food_order_migration_postflight$$
CREATE PROCEDURE assert_royal_bnf_food_order_migration_postflight()
BEGIN
    DECLARE n BIGINT DEFAULT 0;

    SELECT COUNT(*) INTO n FROM food_orders;
    IF n <> 5 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Postflight failed: expected exactly five parent orders';
    END IF;

    SELECT COUNT(*) INTO n
    FROM food_orders
    WHERE id IN (1, 2, 3, 4, 5);
    IF n <> 5 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Postflight failed: parent IDs are not exactly 1 through 5';
    END IF;

    SELECT COUNT(*) INTO n
    FROM royal_bnf_food_order_snapshot s
    LEFT JOIN food_orders fo ON fo.id = s.id
    WHERE fo.id IS NULL;
    IF n <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Postflight failed: a historical parent ID is missing';
    END IF;

    SELECT COUNT(*) INTO n
    FROM royal_bnf_food_order_snapshot s
    JOIN food_orders fo ON fo.id = s.id
    WHERE NOT (fo.booking_id <=> s.booking_id)
       OR NOT (fo.serving_date <=> s.serving_date)
       OR NOT (fo.special_instructions <=> s.special_instructions)
       OR NOT (fo.status <=> s.status)
       OR NOT (fo.created_at <=> s.created_at)
       OR NOT (fo.hotel_food_menu_id <=> s.hotel_food_menu_id)
       OR NOT (fo.quantity <=> s.quantity)
       OR NOT (fo.unit_price <=> s.unit_price)
       OR NOT (fo.total_price <=> s.total_price);
    IF n <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Postflight failed: historical parent fields changed';
    END IF;

    SELECT COUNT(*) INTO n
    FROM (
        SELECT fo.id
        FROM food_orders fo
        LEFT JOIN food_order_items foi ON foi.food_order_id = fo.id
        WHERE fo.id BETWEEN 1 AND 5
        GROUP BY fo.id
        HAVING COUNT(foi.id) = 1
    ) exactly_one_child;
    IF n <> 5 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Postflight failed: expected one child per historical parent';
    END IF;

    SELECT COUNT(*) INTO n
    FROM food_orders fo
    JOIN food_order_items foi ON foi.food_order_id = fo.id
    WHERE fo.id BETWEEN 1 AND 5
      AND (NOT (foi.hotel_food_menu_id <=> fo.hotel_food_menu_id)
           OR NOT (foi.quantity <=> fo.quantity)
           OR NOT (foi.unit_price <=> fo.unit_price)
           OR NOT (foi.total_price <=> fo.total_price));
    IF n <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Postflight failed: historical item snapshot mismatch';
    END IF;
    SELECT COUNT(*) INTO n
    FROM food_orders fo
    JOIN bookings b ON b.id = fo.booking_id
    JOIN rooms r ON r.id = b.room_id
    JOIN hotel_food_menus hfm ON hfm.id = fo.hotel_food_menu_id
    WHERE fo.id BETWEEN 1 AND 5
      AND (fo.hotel_id <> r.hotel_id
           OR r.hotel_id <> hfm.hotel_id
           OR fo.hotel_id <> CASE fo.id
               WHEN 1 THEN 2 WHEN 2 THEN 1 WHEN 3 THEN 1
               WHEN 4 THEN 2 WHEN 5 THEN 2 END);
    IF n <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Postflight failed: historical hotel_id values mismatch';
    END IF;

    SELECT COUNT(*) INTO n
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = 'food_orders'
      AND column_name = 'hotel_id'
      AND referenced_table_name = 'hotels'
      AND referenced_column_name = 'id';
    IF n <> 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Postflight failed: food_orders.hotel_id FK missing';
    END IF;
END$$
CALL assert_royal_bnf_food_order_migration_postflight()$$
DROP PROCEDURE assert_royal_bnf_food_order_migration_postflight$$
DELIMITER ;

-- Post-migration verification queries.
SELECT COUNT(*) AS historical_parent_count,
       COUNT(DISTINCT id) AS distinct_parent_ids,
       MIN(id) AS first_parent_id,
       MAX(id) AS last_parent_id
FROM food_orders;

SELECT COUNT(*) AS historical_parent_count_with_exactly_one_child
FROM (
    SELECT fo.id
    FROM food_orders fo
    JOIN food_order_items foi ON foi.food_order_id = fo.id
    WHERE fo.id BETWEEN 1 AND 5
    GROUP BY fo.id
    HAVING COUNT(foi.id) = 1
) verified;

SELECT fo.id AS order_id, fo.booking_id, fo.hotel_id,
       fo.hotel_food_menu_id AS legacy_menu_id,
       foi.hotel_food_menu_id AS child_menu_id,
       fo.quantity AS legacy_quantity, foi.quantity AS child_quantity,
       fo.unit_price AS legacy_unit_price, foi.unit_price AS child_unit_price,
       fo.total_price AS parent_total, foi.total_price AS child_total,
       fo.serving_date, fo.special_instructions, fo.status, fo.created_at
FROM food_orders fo
LEFT JOIN food_order_items foi ON foi.food_order_id = fo.id
WHERE fo.id BETWEEN 1 AND 5
ORDER BY fo.id;

SELECT COUNT(*) AS parent_child_value_mismatches
FROM food_orders fo
JOIN food_order_items foi ON foi.food_order_id = fo.id
WHERE fo.id BETWEEN 1 AND 5
  AND (fo.hotel_food_menu_id <> foi.hotel_food_menu_id
       OR fo.quantity <> foi.quantity
       OR fo.unit_price <> foi.unit_price
       OR fo.total_price <> foi.total_price);

SELECT COUNT(*) AS historical_parent_field_mismatches
FROM royal_bnf_food_order_snapshot s
JOIN food_orders fo ON fo.id = s.id
WHERE NOT (fo.booking_id <=> s.booking_id)
   OR NOT (fo.serving_date <=> s.serving_date)
   OR NOT (fo.special_instructions <=> s.special_instructions)
   OR NOT (fo.status <=> s.status)
   OR NOT (fo.created_at <=> s.created_at)
   OR NOT (fo.hotel_food_menu_id <=> s.hotel_food_menu_id)
   OR NOT (fo.quantity <=> s.quantity)
   OR NOT (fo.unit_price <=> s.unit_price)
   OR NOT (fo.total_price <=> s.total_price);

SELECT COUNT(*) AS food_orders_hotel_fk_count
FROM information_schema.key_column_usage
WHERE table_schema = DATABASE()
  AND table_name = 'food_orders'
  AND column_name = 'hotel_id'
  AND referenced_table_name = 'hotels'
  AND referenced_column_name = 'id';

SELECT COUNT(*) AS incorrect_historical_hotel_ids
FROM food_orders fo
JOIN bookings b ON b.id = fo.booking_id
JOIN rooms r ON r.id = b.room_id
JOIN hotel_food_menus hfm ON hfm.id = fo.hotel_food_menu_id
WHERE fo.id BETWEEN 1 AND 5
  AND (fo.hotel_id <> r.hotel_id OR r.hotel_id <> hfm.hotel_id);

SELECT id AS order_id,
       hotel_id AS actual_hotel_id,
       CASE id
           WHEN 1 THEN 2 WHEN 2 THEN 1 WHEN 3 THEN 1
           WHEN 4 THEN 2 WHEN 5 THEN 2
       END AS expected_hotel_id
FROM food_orders
WHERE id BETWEEN 1 AND 5
ORDER BY id;
