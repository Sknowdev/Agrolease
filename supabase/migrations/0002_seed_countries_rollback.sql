-- Rollback for 0002_seed_countries.sql
delete from country_config where country_code in (
  'NG','GH','ZA','BR','GB','KE','ET','TZ','UG','RW','ZM','CM','CI','SN','MZ','ZW','EG','ML','BF'
);
