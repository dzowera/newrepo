-- New record for the "account" table

INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony')
('Stark'),
('tony@starkent.com'),
('Iam1ronM@n');

-- Modify the accounttype to "Admin"
UPDATE INTO public.account (account_type)
VALUES ('Admin')
WHERE account_firstname = 'Tony';

-- Delete Tony data from the 
DELETE INTO public.account
WHERE account_firstname = 'Tony'

-- Modify the GM Hummer
UPDATE public.inventory
SET inv_description = REPLACE (inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND 
inv_model = 'Hummer';

-- Selects make, model, and classification name for all Sport category vehicles

SELECT 
    public.inventory.inv_make,
    public.inventory.inv_model,
    public.classification.classification_name
FROM 
    public.inventory
INNER JOIN 
    public.classification ON public.inventory.classification_id = public.classification.classification_id
WHERE 
    public.classification.classification_name = 'Sport';

-- Modify the Image and the Thumbnail colums
UPDATE public.inventory
SET 
  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/')
WHERE 
  inv_image LIKE '/images/%' OR inv_thumbnail LIKE '/images/%';