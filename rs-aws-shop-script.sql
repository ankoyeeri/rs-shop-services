create table products(
	id uuid not null default uuid_generate_v4() primary key,
	title text not null,
	description text,
	price integer
);

create table stocks(
	product_id uuid,
	count integer,
	constraint fk_products
		foreign key(product_id)
			references products(id)
);

insert into products(title, description, price) values 
	('Product #1', 'This is the first product from PostgreSQL', 25),
	('Product #2', 'This is the second product from PostgreSQL', 16),
	('Product #3', 'This is the third product from PostgreSQL', 47),
	('Product #4', 'This is the fourth product from PostgreSQL', 34),
	('Product #5', 'This is the fifth product from PostgreSQL', 85);

insert into stocks(product_id, count) values
	('53cf34bc-00f2-4948-b85b-edb8b966e1f5', 25),
	('9838eea9-374d-4f0b-899a-3732c1d283cd', 77),
	('5e24fba9-c8aa-4632-b013-dcea1148aa56', 19),
	('ad920a03-172b-4087-8526-4b190fb0db19', 25),
	('7ec698ed-f247-4400-83b2-3ccb1f7617de', 30);
	
select * from products;
select * from stocks; 

delete from products where description = '?2';
delete from stocks where count = 11;

select p.id, p.title, p.description, p.price, s.count
from products as p left join stocks as s
	on p.id = s.product_id
WHERE p.id = '53cf34bc-00f2-4948-b85b-edb8b966e1f5';

with new_product as (
	insert into products(title, description, price) values
	('Product #6', 'This is the sixth product from PostgreSQL', 52)
	returning id
)
insert into stocks(product_id, count) values
(
	(select id from new_product),
	25
);