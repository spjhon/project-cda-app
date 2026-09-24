SELECT
    NOW() AS now,
    CURRENT_TIMESTAMP AS current_timestamp,
    CURRENT_DATE AS current_date,
    CURRENT_TIME AS current_time,
    CURRENT_SETTING('TIMEZONE') AS timezone,
    NOW() AT TIME ZONE 'America/Bogota' AS hora_colombia;