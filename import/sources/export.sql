select *, 
	(
		select product_type_name from dbo.product_types where product_type_id = pt.parent_id
	) as 'parentName'
from dbo.product_types pt
