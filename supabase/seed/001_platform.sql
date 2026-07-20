-- UAT demo seed: platform and shared helper.

CREATE OR REPLACE FUNCTION public.uat_demo_upsert(
  p_table regclass,
  p_rows jsonb,
  p_conflict text DEFAULT 'id'
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  insert_columns text;
  select_columns text;
  update_columns text;
  affected_rows integer;
BEGIN
  IF p_rows IS NULL OR jsonb_array_length(p_rows) = 0 THEN
    RETURN 0;
  END IF;

  WITH payload_keys AS (
    SELECT DISTINCT jsonb_object_keys(value) AS key
    FROM jsonb_array_elements(p_rows) AS value
  ),
  table_columns AS (
    SELECT
      attribute.attname,
      attribute.attnum,
      format_type(attribute.atttypid, attribute.atttypmod) AS data_type
    FROM pg_attribute attribute
    WHERE attribute.attrelid = p_table
      AND attribute.attnum > 0
      AND NOT attribute.attisdropped
      AND attribute.attname IN (SELECT key FROM payload_keys)
  )
  SELECT
    string_agg(quote_ident(attname), ', ' ORDER BY attnum),
    string_agg(format('NULLIF(value->>%L, '''')::%s', attname, data_type), ', ' ORDER BY attnum),
    string_agg(format('%1$I = EXCLUDED.%1$I', attname), ', ' ORDER BY attnum)
      FILTER (WHERE attname <> p_conflict)
  INTO insert_columns, select_columns, update_columns
  FROM table_columns;

  IF insert_columns IS NULL THEN
    RETURN 0;
  END IF;

  IF update_columns IS NULL THEN
    EXECUTE format(
      'INSERT INTO %s (%s) SELECT %s FROM jsonb_array_elements($1) AS value ON CONFLICT (%I) DO NOTHING',
      p_table,
      insert_columns,
      select_columns,
      p_conflict
    )
    USING p_rows;
  ELSE
    EXECUTE format(
      'INSERT INTO %s (%s) SELECT %s FROM jsonb_array_elements($1) AS value ON CONFLICT (%I) DO UPDATE SET %s',
      p_table,
      insert_columns,
      select_columns,
      p_conflict,
      update_columns
    )
    USING p_rows;
  END IF;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$;

SELECT public.uat_demo_upsert(
  'public.platforms'::regclass,
  jsonb_build_array(
    jsonb_build_object(
      'id', '00000000-0000-4000-8001-000000000001',
      'name', 'Cape Town Operations',
      'company_name', 'Acme Manufacturing',
      'company_code', 'ACME-CPT',
      'contact_name', 'Operations Manager',
      'contact_email', 'admin@gho.demo',
      'contact_phone', '+27-21-555-0100',
      'package_name', 'Enterprise',
      'status', 'Active',
      'seed_tag', 'uat_demo',
      'created_at', now()::text,
      'updated_at', now()::text
    )
  ),
  'id'
);
