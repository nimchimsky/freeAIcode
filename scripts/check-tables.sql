-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Count records in main tables
SELECT 'canonical_model' as table_name, COUNT(*) as count FROM canonical_model
UNION ALL
SELECT 'provider', COUNT(*) FROM provider
UNION ALL
SELECT 'provider_offer', COUNT(*) FROM provider_offer
UNION ALL
SELECT 'model_alias', COUNT(*) FROM model_alias
UNION ALL
SELECT 'benchmark_score', COUNT(*) FROM benchmark_score
UNION ALL
SELECT 'refresh_log', COUNT(*) FROM refresh_log;
