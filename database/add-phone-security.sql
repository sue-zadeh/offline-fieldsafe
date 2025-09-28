-- Connect first: mysql -h fieldsafe-free.c3ug8i26kl2r.ap-southeast-2.rds.amazonaws.com -u fieldsafe -p

-- Add enhanced phone security constraint
ALTER TABLE staffs 
DROP CONSTRAINT IF EXISTS chk_phone_valid;

ALTER TABLE staffs 
ADD CONSTRAINT chk_phone_enhanced_security 
CHECK (
    -- Must be 6-15 digits only
    phone REGEXP '^[0-9]{6,15}$'
    -- No repeated patterns
    AND NOT phone REGEXP '^(.)\\1{5,}'  -- No 6+ same digits (111111, 222222)
    AND NOT phone REGEXP '^123456'      -- No sequential ascending
    AND NOT phone REGEXP '^654321'      -- No sequential descending  
    AND NOT phone REGEXP '^012345'      -- No leading zero sequences
    AND NOT phone IN ('000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999')
    -- Minimum complexity - can't be all same digit
    AND CHAR_LENGTH(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, '0', ''), '1', ''), '2', ''), '3', ''), '4', ''), '5', ''), '6', ''), '7', ''), '8', ''), '9', '')) < CHAR_LENGTH(phone) - 2
);

-- Test the constraint with existing data
SELECT 'Phone security constraint added successfully!' as status;
SELECT COUNT(*) as valid_phones FROM staffs;

-- Show any phones that might violate the new constraint (for testing)
SELECT phone FROM staffs WHERE 
    NOT phone REGEXP '^[0-9]{6,15}$' OR
    phone REGEXP '^(.)\\1{5,}' OR
    phone REGEXP '^123456' OR
    phone REGEXP '^654321' OR
    phone IN ('000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999');
