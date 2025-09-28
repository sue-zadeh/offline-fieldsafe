-- Connect to your database first:
-- mysql -h fieldsafe-free.c3ug8i26kl2r.ap-southeast-2.rds.amazonaws.com -u fieldsafe -p

-- Step 1: Check current phone data for potential violations
SELECT 'Checking current phone data...' as status;
SELECT id, phone, 
    CASE 
        WHEN phone REGEXP '^[0-9]{6,15}$' THEN '✅ Valid' 
        ELSE '❌ Invalid' 
    END as phone_status
FROM staffs 
ORDER BY id;

-- Step 2: Show any phones that would violate the new constraint
SELECT 'Phones that need fixing:' as status;
SELECT id, phone, 'NEEDS_FIXING' as issue FROM staffs WHERE 
    phone IS NULL OR
    NOT phone REGEXP '^[0-9]{6,15}$' OR
    phone REGEXP '^(.)\\1{5,}' OR
    phone REGEXP '^123456' OR
    phone REGEXP '^654321' OR
    phone IN ('000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999');

-- Step 3: Fix invalid phone numbers (if any exist)
UPDATE staffs SET phone = CONCAT('12345', LPAD(id, 2, '0')) 
WHERE phone IS NULL OR 
      NOT phone REGEXP '^[0-9]{6,15}$' OR
      phone IN ('111', '123', '000', '999');

-- Step 4: Add comprehensive phone security constraint
ALTER TABLE staffs 
ADD CONSTRAINT chk_phone_security 
CHECK (
    -- Must be 6-15 digits only
    phone REGEXP '^[0-9]{6,15}$'
    -- No repeated patterns (111111, 222222, etc)
    AND NOT phone REGEXP '^(.)\\1{5,}'
    -- No sequential patterns  
    AND NOT phone REGEXP '^123456'
    AND NOT phone REGEXP '^654321' 
    AND NOT phone REGEXP '^012345'
    -- Block obvious fake numbers
    AND phone NOT IN ('000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999')
    -- Must have some digit variety (can't be mostly same digits)
    AND CHAR_LENGTH(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, '0', ''), '1', ''), '2', ''), '3', ''), '4', ''), '5', ''), '6', ''), '7', ''), '8', ''), '9', '')) < CHAR_LENGTH(phone) - 1
);

-- Step 5: Verify the constraint was added successfully
SELECT 'Phone security constraint added successfully!' as status;

-- Step 6: Show all current constraints
SELECT 
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_NAME = 'staffs' 
    AND TABLE_SCHEMA = 'fieldsafe'
ORDER BY CONSTRAINT_NAME;

-- Step 7: Test the constraint with some invalid data (these should FAIL)
SELECT 'Testing constraint - the following inserts should FAIL:' as test_status;

-- This should fail: Invalid phone patterns
-- INSERT INTO staffs (firstname, lastname, email, phone, password, role) 
-- VALUES ('Test', 'User', 'test123@example.com', '111111', 'password123', 'Field Staff');

-- INSERT INTO staffs (firstname, lastname, email, phone, password, role) 
-- VALUES ('Test', 'User2', 'test124@example.com', '123456', 'password123', 'Field Staff');

-- Step 8: Show final clean data
SELECT 'Final verification - all phone numbers:' as final_status;
SELECT id, firstname, lastname, email, phone, role FROM staffs ORDER BY id;
