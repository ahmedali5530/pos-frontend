DEFINE FIELD OVERWRITE variant_groups ON TABLE product TYPE any PERMISSIONS FOR create FULL FOR select FULL FOR update FULL;

DEFINE FIELD OVERWRITE allow_price_change ON TABLE product TYPE option<bool | null> DEFAULT false PERMISSIONS FOR create FULL FOR select FULL FOR update FULL;
DEFINE FIELD OVERWRITE allow_discount ON TABLE product TYPE option<bool | null> DEFAULT true PERMISSIONS FOR create FULL FOR select FULL FOR update FULL;
DEFINE FIELD OVERWRITE variable_price ON TABLE product TYPE option<bool | null> DEFAULT false PERMISSIONS FOR create FULL FOR select FULL FOR update FULL;
DEFINE FIELD OVERWRITE price_min ON TABLE product TYPE option<float | null> PERMISSIONS FOR create FULL FOR select FULL FOR update FULL;
DEFINE FIELD OVERWRITE price_max ON TABLE product TYPE option<float | null> PERMISSIONS FOR create FULL FOR select FULL FOR update FULL;
DEFINE FIELD OVERWRITE cart_input_mode ON TABLE product TYPE option<string | null> DEFAULT 'none' PERMISSIONS FOR create FULL FOR select FULL FOR update FULL;

DEFINE TABLE account_group TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD code ON account_group TYPE string PERMISSIONS FULL;
DEFINE FIELD name ON account_group TYPE string PERMISSIONS FULL;
DEFINE FIELD head_type ON account_group TYPE string PERMISSIONS FULL;
DEFINE FIELD normal_balance ON account_group TYPE string PERMISSIONS FULL;
DEFINE FIELD notes ON account_group TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD store ON account_group TYPE option<record<store> | null> PERMISSIONS FULL;
DEFINE FIELD is_active ON account_group TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD created_at ON account_group TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD updated_at ON account_group TYPE option<datetime | null> PERMISSIONS FULL;

DEFINE INDEX account_group_code_store_unique ON TABLE account_group COLUMNS code, store UNIQUE;

DEFINE TABLE account TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD code ON account TYPE string PERMISSIONS FULL;
DEFINE FIELD name ON account TYPE string PERMISSIONS FULL;
DEFINE FIELD group ON account TYPE option<record<account_group> | null> PERMISSIONS FULL;
DEFINE FIELD account_type ON account TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD normal_balance ON account TYPE string PERMISSIONS FULL;
DEFINE FIELD parent ON account TYPE option<record<account> | null> PERMISSIONS FULL;
DEFINE FIELD notes ON account TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD store ON account TYPE option<record<store> | null> PERMISSIONS FULL;
DEFINE FIELD is_active ON account TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD created_at ON account TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD updated_at ON account TYPE option<datetime | null> PERMISSIONS FULL;

DEFINE INDEX account_code_store_unique ON TABLE account COLUMNS code, store UNIQUE;

DEFINE TABLE account_journal_entry TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD entry_number ON account_journal_entry TYPE int PERMISSIONS FULL;
DEFINE FIELD date ON account_journal_entry TYPE datetime PERMISSIONS FULL;
DEFINE FIELD memo ON account_journal_entry TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD source_module ON account_journal_entry TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD source_id ON account_journal_entry TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD store ON account_journal_entry TYPE option<record<store> | null> PERMISSIONS FULL;
DEFINE FIELD created_by ON account_journal_entry TYPE option<record<user_account> | null> PERMISSIONS FULL;
DEFINE FIELD posted ON account_journal_entry TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD lines ON account_journal_entry TYPE option<array<record<account_journal_line>> | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON account_journal_entry TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD updated_at ON account_journal_entry TYPE option<datetime | null> PERMISSIONS FULL;

DEFINE INDEX account_journal_entry_number_store_unique ON TABLE account_journal_entry COLUMNS entry_number, store UNIQUE;

DEFINE TABLE account_journal_line TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD entry ON account_journal_line TYPE record<account_journal_entry> PERMISSIONS FULL;
DEFINE FIELD account ON account_journal_line TYPE record<account> PERMISSIONS FULL;
DEFINE FIELD debit ON account_journal_line TYPE float DEFAULT 0 PERMISSIONS FULL;
DEFINE FIELD credit ON account_journal_line TYPE float DEFAULT 0 PERMISSIONS FULL;
DEFINE FIELD description ON account_journal_line TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON account_journal_line TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;