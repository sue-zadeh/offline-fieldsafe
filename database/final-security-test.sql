-- Connect: mysql -h fieldsafe-free.c3ug8i26kl2r.ap-southeast-2.rds.amazonaws.com -u fieldsafe -p

SELECT '🔍 FINAL SECURITY AUDIT' as test_phase;

-- Show all constraints
SELECT 
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE,
    'ACTIVE' as status
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_NAME = 'staffs' AND TABLE_SCHEMA = 'fieldsafe'
ORDER BY CONSTRAINT_NAME;

-- Test all bypass attempts (these should ALL FAIL)
SELECT '🚨 TESTING BYPASS ATTEMPTS - ALL SHOULD FAIL' as test_phase;

-- Bad firstname
INSERT INTO staffs VALUES (999, 'x', 'ValidName', 'test1@company.com', '123456', 'pass', 'Field Staff');

-- Bad lastname  
INSERT INTO staffs VALUES (999, 'ValidName', 'y', 'test2@company.com', '123457', 'pass', 'Field Staff');

-- Bad email
INSERT INTO staffs VALUES (999, 'ValidName', 'ValidName', 'bademail', '123458', 'pass', 'Field Staff');

-- Bad phone (if constraint exists)
INSERT INTO staffs VALUES (999, 'ValidName', 'ValidName', 'test3@company.com', '111', 'pass', 'Field Staff');

SELECT '✅ SECURITY TEST COMPLETE' as final_status;
SELECT 'If all inserts failed with constraint violations, security is BULLETPROOF!' as result;
