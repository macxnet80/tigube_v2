-- travel_cost_config aus Legacy services_with_categories füllen (€/km)
UPDATE public.caretaker_profiles cp
SET travel_cost_config = agg.cfg
FROM (
  SELECT
    cp2.id,
    jsonb_strip_nulls(
      jsonb_build_object(
        'price_per_km',
        MIN(
          REPLACE(NULLIF(trim(elem->>'price'), ''), ',', '.')::double precision
        )
      )
    ) AS cfg
  FROM public.caretaker_profiles cp2
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE
      WHEN jsonb_typeof(cp2.services_with_categories) = 'array'
      THEN cp2.services_with_categories
      ELSE '[]'::jsonb
    END
  ) AS elem
  WHERE cp2.travel_cost_config IS NULL
    AND elem->>'name' IS NOT NULL
    AND NOT (
      lower(trim(elem->>'name')) LIKE '%keine %'
      AND lower(trim(elem->>'name')) LIKE '%anfahr%'
    )
    AND (
      lower(trim(elem->>'name')) LIKE '%anfahrkosten%'
      OR lower(trim(elem->>'name')) = 'anfahrt'
      OR lower(trim(elem->>'name')) = 'anfahrtskosten'
      OR (
        lower(trim(elem->>'name')) LIKE '%anfahrt%'
        AND lower(trim(elem->>'name')) NOT LIKE 'keine %'
      )
    )
    AND elem->>'price' IS NOT NULL
    AND trim(elem->>'price') <> ''
    AND REPLACE(trim(elem->>'price'), ',', '.') ~ '^[0-9]+([.][0-9]+)?$'
  GROUP BY cp2.id
  HAVING MIN(REPLACE(trim(elem->>'price'), ',', '.')::double precision) > 0
) agg
WHERE cp.id = agg.id;
