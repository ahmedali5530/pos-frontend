-- ------------------------------
-- OPTION
-- ------------------------------

OPTION IMPORT;

-- ------------------------------
-- TABLE: app_connection
-- ------------------------------

DEFINE TABLE app_connection TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created_at ON app_connection TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD device ON app_connection TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD store ON app_connection TYPE record<store> PERMISSIONS FULL;
DEFINE FIELD terminal ON app_connection TYPE record<terminal> PERMISSIONS FULL;
DEFINE FIELD user ON app_connection TYPE record<user_account> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: app_connection
-- ------------------------------

INSERT [ { created_at: d'2026-02-20T05:50:55.296828360Z', device: 'vivo-V2529', id: app_connection:oysn1os7xnde5bss5z3e, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { created_at: d'2026-02-20T05:50:55.285686362Z', device: 'vivo-V2529', id: app_connection:wq5u2wgfdzciykpmykvh, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn } ];

-- ------------------------------
-- TABLE: barcode
-- ------------------------------

DEFINE TABLE barcode TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD barcode ON barcode TYPE string PERMISSIONS FULL;
DEFINE FIELD created_at ON barcode TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD deleted_at ON barcode TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD is_active ON barcode TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD item ON barcode TYPE option<record<product> | null> PERMISSIONS FULL;
DEFINE FIELD measurement ON barcode TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD price ON barcode TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD unit ON barcode TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD updated_at ON barcode TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD usages ON barcode TYPE option<int | null> PERMISSIONS FULL;
DEFINE FIELD used ON barcode TYPE option<int | null> PERMISSIONS FULL;
DEFINE FIELD uuid ON barcode TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD variant ON barcode TYPE option<record<product_variant> | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: barcode
-- ------------------------------

INSERT [ { barcode: '398450398450', created_at: NULL, deleted_at: NULL, id: barcode:9jwse6y1ybgcannrnmj5, is_active: true, item: product:2010, measurement: '0.25', price: 350dec, unit: 'kg', updated_at: NULL, usages: NULL, used: NULL, uuid: NULL } ];

-- ------------------------------
-- TABLE: brand
-- ------------------------------

DEFINE TABLE brand TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created_at ON brand TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD is_active ON brand TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD media ON brand TYPE option<record<media> | null> PERMISSIONS FULL;
DEFINE FIELD name ON brand TYPE string PERMISSIONS FULL;
DEFINE FIELD stores ON brand TYPE array<record<store>> PERMISSIONS FULL;
DEFINE FIELD stores[*] ON brand TYPE record<store> PERMISSIONS FULL;
DEFINE FIELD updated_at ON brand TYPE option<datetime | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: brand
-- ------------------------------

INSERT [ { created_at: d'2026-01-25T17:54:27.434615273Z', id: brand:7m995ydudabd67wv4s9c, is_active: true, name: 'bata', stores: [store:ejrxrfl3bs3q3z0gtbri, store:nlh64knntpdopce0aq7l, store:q4yr0krhgdw4v3wncjft] }, { id: brand:8kty87fap8zlogdw5d7u, is_active: true, name: 'nike', stores: [store:q4yr0krhgdw4v3wncjft] }, { created_at: d'2026-02-19T15:57:43.850705974Z', id: brand:d8jasehpabtfh3ijcr5o, is_active: true, name: 'local', stores: [store:ejrxrfl3bs3q3z0gtbri, store:nlh64knntpdopce0aq7l, store:q4yr0krhgdw4v3wncjft] }, { id: brand:q4qbuh8kuxhs8cpeee7z, is_active: true, name: 'bonjon', stores: [store:ejrxrfl3bs3q3z0gtbri, store:nlh64knntpdopce0aq7l, store:q4yr0krhgdw4v3wncjft] } ];

-- ------------------------------
-- TABLE: cart
-- ------------------------------

DEFINE TABLE cart TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD barcode ON cart TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON cart TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD item ON cart TYPE record<product> PERMISSIONS FULL;
DEFINE FIELD price ON cart TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD quantity ON cart TYPE float PERMISSIONS FULL;
DEFINE FIELD store ON cart TYPE record<store> PERMISSIONS FULL;
DEFINE FIELD terminal ON cart TYPE record<terminal> PERMISSIONS FULL;
DEFINE FIELD user ON cart TYPE record<user_account> PERMISSIONS FULL;
DEFINE FIELD variant ON cart TYPE option<record<product_variant> | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: cart
-- ------------------------------

INSERT [ { barcode: '4848118345', created_at: d'2026-02-15T08:09:46.318017021Z', id: cart:0a1oe0z31yeoulsczxxa, item: product:kad8ilvog96sm8d8s2u7, price: 100f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: NULL }, { barcode: '4848118345', created_at: d'2026-02-15T07:43:38.629074103Z', id: cart:1wkmpxgyd9icq86b3a06, item: product:kad8ilvog96sm8d8s2u7, price: NaN, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: NULL }, { barcode: '80693972521', created_at: d'2026-02-15T08:20:20.175203390Z', id: cart:5amv5bo8tw8rq7jdqnur, item: product:ipf29wf0h3nzvao7vs3y, price: 1200f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: product_variant:d41es4jol5sdbi1mgwmm }, { barcode: '80693972521', created_at: d'2026-02-15T07:43:44.562982948Z', id: cart:5h0n4p77sccam89fr6oj, item: product:ipf29wf0h3nzvao7vs3y, price: 1200f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: product_variant:d41es4jol5sdbi1mgwmm }, { barcode: '80693972521', created_at: d'2026-02-15T08:20:14.310661062Z', id: cart:5ji2zu7g12ufflrisw4w, item: product:ipf29wf0h3nzvao7vs3y, price: 1200f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: product_variant:d41es4jol5sdbi1mgwmm }, { barcode: '80693972521', created_at: d'2026-02-15T08:20:53.154456823Z', id: cart:6zcrhambdyvm46ztoskf, item: product:ipf29wf0h3nzvao7vs3y, price: 1200f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: product_variant:d41es4jol5sdbi1mgwmm }, { barcode: '4848118345', created_at: d'2026-02-15T08:09:42.321721350Z', id: cart:7mc0mxt3r8mefz0c5phr, item: product:kad8ilvog96sm8d8s2u7, price: 100f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: NULL }, { barcode: '4848118345', created_at: d'2026-02-15T07:43:44.548753315Z', id: cart:d3586wnryj0yg4ftyx87, item: product:kad8ilvog96sm8d8s2u7, price: NaN, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: NULL }, { barcode: '80693972521', created_at: d'2026-02-15T08:20:16.156459558Z', id: cart:di2aqp0vvnniagq8p97z, item: product:ipf29wf0h3nzvao7vs3y, price: 1200f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: product_variant:d41es4jol5sdbi1mgwmm }, { barcode: '4848118345', created_at: d'2026-02-15T07:43:43.024119381Z', id: cart:e07evq6dnt9m47n1yjjt, item: product:kad8ilvog96sm8d8s2u7, price: NaN, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: NULL }, { barcode: '80693972521', created_at: d'2026-02-15T08:23:00.558860575Z', id: cart:jfgoz7dr61g8yyxu6ytf, item: product:ipf29wf0h3nzvao7vs3y, price: 1200f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: product_variant:d41es4jol5sdbi1mgwmm }, { barcode: '80693972521', created_at: d'2026-02-15T07:43:38.700922674Z', id: cart:mtr4vrb3ou9tb4dbzi51, item: product:ipf29wf0h3nzvao7vs3y, price: 1200f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: product_variant:d41es4jol5sdbi1mgwmm }, { barcode: '4848118345', created_at: d'2026-02-15T07:43:41.502304359Z', id: cart:niinasmom30s26sj3e7i, item: product:kad8ilvog96sm8d8s2u7, price: NaN, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: NULL }, { barcode: '80693972521', created_at: d'2026-02-15T07:43:41.485491854Z', id: cart:nqclo1w69qdp2w4cta2e, item: product:ipf29wf0h3nzvao7vs3y, price: 1200f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: product_variant:d41es4jol5sdbi1mgwmm }, { barcode: '80693972521', created_at: d'2026-02-15T07:43:43.035861347Z', id: cart:pouks2uhyp1qpk3k9wb0, item: product:ipf29wf0h3nzvao7vs3y, price: 1200f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: product_variant:d41es4jol5sdbi1mgwmm }, { barcode: '4848118345', created_at: d'2026-02-15T08:09:31.131789812Z', id: cart:qfk8n6r0flrds2tc8w8i, item: product:kad8ilvog96sm8d8s2u7, price: 100f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: NULL }, { barcode: '80693972521', created_at: d'2026-02-15T08:20:12.267743085Z', id: cart:ukvb92mnxu9yxsrmal5u, item: product:ipf29wf0h3nzvao7vs3y, price: 1200f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: product_variant:d41es4jol5sdbi1mgwmm }, { barcode: '4848118345', created_at: d'2026-02-15T08:09:48.470396970Z', id: cart:ulps7wvgrnhg3mnwy1dr, item: product:kad8ilvog96sm8d8s2u7, price: 100f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: NULL }, { barcode: '80693972521', created_at: d'2026-02-15T08:20:17.520957207Z', id: cart:v8zkt6gjia71l0s4eszz, item: product:ipf29wf0h3nzvao7vs3y, price: 1200f, quantity: 1f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn, variant: product_variant:d41es4jol5sdbi1mgwmm } ];

-- ------------------------------
-- TABLE: category
-- ------------------------------

DEFINE TABLE category TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created_at ON category TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD is_active ON category TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD name ON category TYPE string PERMISSIONS FULL;
DEFINE FIELD parent ON category TYPE option<record<category> | null> PERMISSIONS FULL;
DEFINE FIELD stores ON category TYPE array<record<store>> PERMISSIONS FULL;
DEFINE FIELD stores[*] ON category TYPE record<store> PERMISSIONS FULL;
DEFINE FIELD type ON category TYPE option<string | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: category
-- ------------------------------

INSERT [ { id: category:1trw9x6qeo683m84myw5, is_active: true, name: 'Shoes', stores: [store:ejrxrfl3bs3q3z0gtbri, store:nlh64knntpdopce0aq7l, store:q4yr0krhgdw4v3wncjft] }, { created_at: d'2026-02-11T17:27:46.738907475Z', id: category:5unry6ehuqav0nsglywo, is_active: true, name: 'caps', stores: [store:ejrxrfl3bs3q3z0gtbri, store:nlh64knntpdopce0aq7l, store:q4yr0krhgdw4v3wncjft] }, { created_at: d'2026-01-27T06:28:33.365815474Z', id: category:lgj4pkz7yj5u514mmjqw, is_active: true, name: 'pants', stores: [store:ejrxrfl3bs3q3z0gtbri, store:nlh64knntpdopce0aq7l, store:q4yr0krhgdw4v3wncjft] }, { created_at: d'2026-02-19T15:57:31.781751787Z', id: category:m7hxmspxm4qpw7h6xzyq, is_active: true, name: 'vegetables', stores: [store:ejrxrfl3bs3q3z0gtbri, store:nlh64knntpdopce0aq7l, store:q4yr0krhgdw4v3wncjft] }, { id: category:x3dl9poz2bmykna9iytt, is_active: true, name: 'shirts', stores: [store:ejrxrfl3bs3q3z0gtbri, store:nlh64knntpdopce0aq7l, store:q4yr0krhgdw4v3wncjft] } ];

-- ------------------------------
-- TABLE: closing
-- ------------------------------

DEFINE TABLE closing TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD cash_added ON closing TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD cash_withdrawn ON closing TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD closed_at ON closing TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD closed_by ON closing TYPE option<record<user_account> | null> PERMISSIONS FULL;
DEFINE FIELD closing_balance ON closing TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON closing TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD data ON closing FLEXIBLE TYPE any PERMISSIONS FULL;
DEFINE FIELD date_from ON closing TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD date_to ON closing TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD deleted_at ON closing TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD denominations ON closing FLEXIBLE TYPE any PERMISSIONS FULL;
DEFINE FIELD expenses ON closing TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD opened_by ON closing TYPE option<record<user_account> | null> PERMISSIONS FULL;
DEFINE FIELD opening_balance ON closing TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD store ON closing TYPE option<record<store> | null> PERMISSIONS FULL;
DEFINE FIELD terminal ON closing TYPE option<record<terminal> | null> PERMISSIONS FULL;
DEFINE FIELD updated_at ON closing TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD uuid ON closing TYPE option<string | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: closing
-- ------------------------------

INSERT [ { cash_added: 0f, cash_withdrawn: 0f, closed_by: user_account:wh4jdwgbk9e0ajn6tpfn, closing_balance: 0f, created_at: d'2026-02-12T10:21:21.414470243Z', data: { cash: '0' }, date_from: d'2026-02-12T10:21:16.249Z', date_to: d'2026-02-12T10:21:21.407Z', id: closing:ae8pmxe4v2y6clst0h78, opened_by: user_account:wh4jdwgbk9e0ajn6tpfn, opening_balance: 0f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:99xzlze67p8yqelhulha }, { cash_added: 0f, cash_withdrawn: 0f, data: { cash: '0' }, id: closing:nxczxglf22rpk2tn40zy, opening_balance: 0f, store: store:q4yr0krhgdw4v3wncjft, terminal: terminal:j7v7baelzij0efxsjwuz } ];

-- ------------------------------
-- TABLE: customer
-- ------------------------------

DEFINE TABLE customer TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD address ON customer TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD allow_credit_sale ON customer TYPE option<bool | null> PERMISSIONS FULL;
DEFINE FIELD birthday ON customer TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD cnic ON customer TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON customer TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD credit_limit ON customer TYPE option<float | null> DEFAULT 0 PERMISSIONS FULL;
DEFINE FIELD email ON customer TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD lat ON customer TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD lng ON customer TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD name ON customer TYPE string PERMISSIONS FULL;
DEFINE FIELD opening_balance ON customer TYPE option<float | null> DEFAULT 0 PERMISSIONS FULL;
DEFINE FIELD orders ON customer TYPE option<array<record<order>> | null> PERMISSIONS FULL;
DEFINE FIELD orders[*] ON customer TYPE record<order> PERMISSIONS FULL;
DEFINE FIELD payments ON customer TYPE option<array<record<customer_payment>> | null> PERMISSIONS FULL;
DEFINE FIELD payments[*] ON customer TYPE record<customer_payment> PERMISSIONS FULL;
DEFINE FIELD phone ON customer TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD whatsapp ON customer TYPE option<string | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: customer
-- ------------------------------

INSERT [ { cnic: '', created_at: d'2026-02-09T12:05:22.803921884Z', credit_limit: 1500f, id: customer:di37bb1l9hrbo6946rkv, name: 'Ahmed', opening_balance: 100f, orders: [order:9fpbzv1gpi06mj44f82q], payments: [customer_payment:pll01vitoux10xk66v2i, customer_payment:86eswxa12ia0rkwpoetz, customer_payment:sm4rs2otz24oba8nf2oc], phone: '03224701210' }, { cnic: '', created_at: d'2026-02-09T07:36:08.256068016Z', credit_limit: 0f, id: customer:kn1vni06s2zfi8b5hh5w, name: 'ramzan', opening_balance: 0f, phone: '03654615' } ];

-- ------------------------------
-- TABLE: customer_payment
-- ------------------------------

DEFINE TABLE customer_payment TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD amount ON customer_payment TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON customer_payment TYPE option<datetime | null> DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD customer ON customer_payment TYPE record<customer> PERMISSIONS FULL;
DEFINE FIELD description ON customer_payment TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD order ON customer_payment TYPE option<record<order> | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: customer_payment
-- ------------------------------

INSERT [ { amount: 1f, created_at: d'2026-02-09T07:17:09.403451821Z', customer: customer:di37bb1l9hrbo6946rkv, description: 'dfsdf', id: customer_payment:5ryrgo29hh3gyvoorkl9 }, { amount: 1f, created_at: d'2026-02-09T07:20:44.102536798Z', customer: customer:di37bb1l9hrbo6946rkv, description: 'dfsdf', id: customer_payment:86eswxa12ia0rkwpoetz }, { amount: 1f, created_at: d'2026-02-09T06:50:34.510477037Z', customer: customer:di37bb1l9hrbo6946rkv, description: 'dfsdf', id: customer_payment:9euv8ei3cs9csc10pboo }, { amount: 100f, created_at: d'2026-02-09T06:46:48.166693762Z', customer: customer:di37bb1l9hrbo6946rkv, description: 'all done', id: customer_payment:pll01vitoux10xk66v2i }, { amount: -1f, created_at: d'2026-02-09T07:29:44.882531916Z', customer: customer:di37bb1l9hrbo6946rkv, description: 'kjsf', id: customer_payment:sm4rs2otz24oba8nf2oc } ];

-- ------------------------------
-- TABLE: department
-- ------------------------------

DEFINE TABLE department TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created_at ON department TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD description ON department TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD is_active ON department TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD name ON department TYPE string PERMISSIONS FULL;
DEFINE FIELD store ON department TYPE option<record<store> | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: department
-- ------------------------------

INSERT [ { description: '', id: department:33osspfyit3vv5biq29n, is_active: true, name: 'cloths', store: store:ejrxrfl3bs3q3z0gtbri }, { created_at: d'2026-02-19T15:47:06.685943685Z', description: '', id: department:onvprzmbzjpo6ghyniv7, is_active: true, name: 'vegetables', store: store:q4yr0krhgdw4v3wncjft } ];

-- ------------------------------
-- TABLE: device
-- ------------------------------

DEFINE TABLE device TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD ip_address ON device TYPE string PERMISSIONS FULL;
DEFINE FIELD name ON device TYPE string PERMISSIONS FULL;
DEFINE FIELD port ON device TYPE option<int | null> PERMISSIONS FULL;
DEFINE FIELD prints ON device TYPE int DEFAULT 1 PERMISSIONS FULL;
DEFINE FIELD uuid ON device TYPE option<string | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: device
-- ------------------------------


-- ------------------------------
-- TABLE: discount
-- ------------------------------

DEFINE TABLE discount TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created_at ON discount TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD is_active ON discount TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD name ON discount TYPE string PERMISSIONS FULL;
DEFINE FIELD rate ON discount TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD rate_type ON discount TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD scope ON discount TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD stores ON discount TYPE array<record<store>> PERMISSIONS FULL;
DEFINE FIELD stores[*] ON discount TYPE record<store> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: discount
-- ------------------------------

INSERT [ { id: discount:nzo7807p7zjzqdjfpuss, is_active: true, name: '100%', rate: 100f, rate_type: 'percent', scope: 'exact', stores: [store:ejrxrfl3bs3q3z0gtbri, store:nlh64knntpdopce0aq7l, store:q4yr0krhgdw4v3wncjft] }, { created_at: d'2026-02-09T09:37:14.133913976Z', id: discount:ylk15llokt18l8338p5g, is_active: true, name: 'open', rate_type: 'percent', scope: 'open', stores: [store:nlh64knntpdopce0aq7l, store:ejrxrfl3bs3q3z0gtbri, store:q4yr0krhgdw4v3wncjft] } ];

-- ------------------------------
-- TABLE: expense
-- ------------------------------

DEFINE TABLE expense TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD amount ON expense TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON expense TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD description ON expense TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD is_active ON expense TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD store ON expense TYPE option<record<store> | null> PERMISSIONS FULL;
DEFINE FIELD user ON expense TYPE record<user_account> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: expense
-- ------------------------------

INSERT [ { amount: 4f, created_at: d'2026-02-08T07:18:32.091Z', description: 'sdfsf', id: expense:4yye60u53dc6h58d9bmp, is_active: true, store: store:q4yr0krhgdw4v3wncjft, user: user_account:wh4jdwgbk9e0ajn6tpfn } ];

-- ------------------------------
-- TABLE: location
-- ------------------------------

DEFINE TABLE location TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created_at ON location TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD is_active ON location TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD location ON location TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD name ON location TYPE string PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: location
-- ------------------------------


-- ------------------------------
-- TABLE: media
-- ------------------------------

DEFINE TABLE media TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created_at ON media TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD extension ON media TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD mime_type ON media TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD name ON media TYPE string PERMISSIONS FULL;
DEFINE FIELD original_name ON media TYPE string PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: media
-- ------------------------------


-- ------------------------------
-- TABLE: order
-- ------------------------------

DEFINE TABLE order TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD adjustment ON order TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON order TYPE option<datetime | null> DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD customer ON order TYPE option<record<customer> | null> PERMISSIONS FULL;
DEFINE FIELD description ON order TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD discount ON order TYPE option<record<order_discount> | null> PERMISSIONS FULL;
DEFINE FIELD is_deleted ON order TYPE option<bool | null> PERMISSIONS FULL;
DEFINE FIELD is_dispatched ON order TYPE option<bool | null> PERMISSIONS FULL;
DEFINE FIELD is_returned ON order TYPE option<bool | null> PERMISSIONS FULL;
DEFINE FIELD is_suspended ON order TYPE option<bool | null> PERMISSIONS FULL;
DEFINE FIELD items ON order TYPE array<record<order_product>> PERMISSIONS FULL;
DEFINE FIELD items[*] ON order TYPE record<order_product> PERMISSIONS FULL;
DEFINE FIELD order_id ON order TYPE option<int | null> PERMISSIONS FULL;
DEFINE FIELD payments ON order TYPE option<array<record<order_payment>> | null> PERMISSIONS FULL;
DEFINE FIELD payments[*] ON order TYPE record<order_payment> PERMISSIONS FULL;
DEFINE FIELD returned_from ON order TYPE option<record<order> | null> PERMISSIONS FULL;
DEFINE FIELD status ON order TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD store ON order TYPE option<record<store> | null> PERMISSIONS FULL;
DEFINE FIELD tax ON order TYPE option<record<order_tax> | null> PERMISSIONS FULL;
DEFINE FIELD terminal ON order TYPE option<record<terminal> | null> PERMISSIONS FULL;
DEFINE FIELD user ON order TYPE option<record<user_account> | null> PERMISSIONS FULL;
DEFINE FIELD uuid ON order TYPE option<string | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: order
-- ------------------------------

INSERT [ { adjustment: 0f, created_at: d'2026-02-17T16:08:21.380245590Z', customer: NULL, description: '', discount: NULL, id: order:2i1hasqwjwn0l1uqpenz, items: [order_product:jg492uimxbpmjg5ulz1j], order_id: 58, payments: [order_payment:0zk948d5bkrv17wksf93], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-16T14:22:59.754588260Z', customer: NULL, description: '', discount: NULL, id: order:2ietbys38cfzcnksxmer, items: [order_product:y1zqvljhnz87olg5vxex], order_id: 46, payments: [order_payment:ehljnsz3gc6uq10sdaoo], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-17T14:48:07.756321293Z', customer: NULL, description: '', discount: NULL, id: order:3q8c0hdioqgp3dhf8rku, items: [order_product:ppmp2602oyyxmo6c24er], order_id: 55, payments: [order_payment:yk8naxipzarl1v9tokw8], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:z15qp9h6eleqd5rhovf9, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-21T17:55:57.347732994Z', customer: NULL, description: '', discount: NULL, id: order:3rre5nlf5frmas603kth, items: [order_product:i8pwzlxqt0aegjkywrt9], order_id: 63, payments: [order_payment:mp3jonb4jcws0196vr00], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-21T18:05:25.463576583Z', customer: NULL, description: '', discount: NULL, id: order:54vtnnqcmsa66p6nreiv, items: [order_product:ekazt1th0a6pagl3u376], order_id: 67, payments: [order_payment:nzwp0f01vn0psxbzhlr5], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:t9ulbebfi3xahtbdwr5g, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-17T14:48:42.819432879Z', customer: NULL, description: '', discount: NULL, id: order:5d9csjclhp18e8h8cdq5, items: [order_product:e39m8jbta0bd70m420w8], order_id: 56, payments: [order_payment:mgq8cbj7r0wwbwp64suw], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:mdygkrswwd3jg6l3ds2u, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-19T17:21:34.156025648Z', customer: NULL, description: '', discount: NULL, id: order:6cwkh4tp7erdm7zsvtms, items: [order_product:prub197hz9b6dunavvhs], order_id: 59, payments: [order_payment:7jiizp53tj1gwvwvjfql], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-16T14:32:48.028524533Z', customer: NULL, description: '', discount: NULL, id: order:78h975dizjvkve6f6zdt, items: [order_product:lb8cw0dwbxk2czl63mnp], order_id: 52, payments: [order_payment:7fojyqndbhghkgn27ktr, order_payment:xdc8yklc37785xrwfyk1, order_payment:bdxcf8fs7vgbj5uaovz6], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:j7v7baelzij0efxsjwuz, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-17T15:26:03.062792227Z', customer: NULL, description: '', discount: NULL, id: order:930vba19vabhl7tv9a0x, items: [order_product:wfy5em2zl1ru5l9pjqgf], order_id: 57, payments: [order_payment:9cr30jphcmdbi7gs9af7], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:3bkegp227k7cwii6v2md, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-09T11:39:27.466927730Z', customer: customer:di37bb1l9hrbo6946rkv, description: '', discount: NULL, id: order:9fpbzv1gpi06mj44f82q, items: [order_product:uvfedfv939w0pqcmekzp, order_product:o8p38yci6vc86xb71lpk], order_id: 2, payments: [order_payment:xo9cfjkwo8cr6bh4se6y], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:j7v7baelzij0efxsjwuz, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-22T07:14:25.521620799Z', customer: NULL, description: '', discount: NULL, id: order:aj0nrxl9ln3wsxht4fv1, items: [order_product:s22wenipxtuusvm7mgow], order_id: 73, payments: [order_payment:t4u51hd19dypdk5ttwwg], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:cqaccy1hruo8w029m0s1, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-21T18:24:38.663475581Z', customer: NULL, description: '', discount: NULL, id: order:b3mcfrhhqk7gd83pphv6, items: [order_product:8tc0u7oyemdmnbp7z3af], order_id: 69, payments: [order_payment:gj2fr3w0537ou4pfw7xk], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-22T07:04:36.046473158Z', customer: NULL, description: '', discount: NULL, id: order:bxo52bviul6f4nhqpa53, items: [order_product:sreyz804xl5ju400cqw0], order_id: 72, payments: [order_payment:5ucox4l6hgzag36jup5d], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-16T12:48:49.077245295Z', customer: NULL, description: '', discount: NULL, id: order:clsp9rwtisqesagli3it, items: [order_product:185mw477tpqui9fm9w38], order_id: 47, payments: [order_payment:r1jjbit8a031shg4kikx], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-21T18:26:32.326585692Z', customer: NULL, description: '', discount: NULL, id: order:d2vpj1vy6uurti6jehv8, items: [order_product:0j274pcgjqu554gccloo], order_id: 71, payments: [order_payment:goid79wdwvs6070feg33], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-16T14:21:12.445415115Z', customer: NULL, description: '', discount: NULL, id: order:fkcnegr9iwjiuxweyjmx, items: [order_product:41rdg63p6r1xkt6f1h40], order_id: 48, payments: [order_payment:kf6309765t31zxh6y1pt], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:kp7fdxyrlj3dtt88plsv, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-16T14:33:11.428149585Z', customer: NULL, description: '', discount: NULL, id: order:gp6jwqcec26lca57je80, items: [order_product:zlxy4p64rkfn38wm2ic8], order_id: 51, payments: [order_payment:ol4x54yb66gu066ht4l8], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:8wpqsbqlaclrdjc1tekm, terminal: terminal:j7v7baelzij0efxsjwuz, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-17T14:47:35.462832986Z', customer: NULL, description: '', discount: NULL, id: order:gxw9fv46ccox482k9vxz, items: [order_product:ugmpe7sbl8rlozln0b6x], order_id: 54, payments: [order_payment:6rrzr6r20dm7oves7r11], returned_from: NULL, status: 'Pending', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-20T10:14:53.200391701Z', customer: NULL, description: '', discount: NULL, id: order:hpc96jiohnt01ppwjf98, items: [order_product:0lyjzdqzjzsyeis9g1gz, order_product:b502bs2app3susmav1f4, order_product:yazggatilgd7jdjf5m8u], order_id: 62, payments: [order_payment:26wqt78ruspwrz55h0ey], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-16T11:11:01.154037367Z', customer: NULL, description: '', discount: NULL, id: order:i36e5ajyb78oslgphkjf, items: [order_product:ii0nsotvj0gw5g2op2vp, order_product:ptcwd5k34qu3aoo2mx7p, order_product:l6ic47gukr3uc38prwv7, order_product:yynxxj68i6jlx6ap9j0u], order_id: 8, payments: [order_payment:zdnrg5ok66ql6t2tnys7], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:x05enwb3dyd7o24c1vtn, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-15T10:43:34.114127377Z', customer: customer:kn1vni06s2zfi8b5hh5w, description: '', discount: NULL, id: order:ik8c7rwzqrrwr94s0qxh, items: [order_product:h5ygdex004z23yvzfu7w, order_product:pfi13k0uc8y9487jff9v], order_id: 5, payments: [order_payment:azk08duxbj7e7fysvmhi], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-21T18:02:30.717797504Z', customer: NULL, description: '', discount: NULL, id: order:iue4gw690mh6vkoexa4e, items: [order_product:r05fl6gx5jhtio4bj3hf], order_id: 64, payments: [order_payment:4wlo8bl4hry6hvx3ya4b], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-16T06:42:52.789616959Z', customer: NULL, description: '', discount: NULL, id: order:j1s6baj6xagribhe1m8d, items: [order_product:1nohkwq2wa1dt7okevut, order_product:weoyeldo599qgawe2hje, order_product:yyce6eaumydf76v22zxc], order_id: 7, payments: [order_payment:6lmj33thyku03o5tcfli], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:38t5wboymcl33jndohd2, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-21T18:23:32.592321042Z', customer: NULL, description: '', discount: NULL, id: order:k2qedpqfxv91mon2vth4, items: [order_product:4c6c22l1eukebt8hunf0], order_id: 68, payments: [order_payment:c7f3v0iyv5rr5zainuhr], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:gkndv9nk853q8j2vqbt9, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-12T14:42:39.215075119Z', customer: NULL, description: '', discount: NULL, id: order:kszqp53g8taa2u9639mh, items: [order_product:urikws4l5d6del3k5tsq], order_id: 3, payments: [order_payment:mjpjnfwpkn9kqzk2ijak], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-21T18:04:18.419671609Z', customer: NULL, description: '', discount: NULL, id: order:osu3wijothao8rxnvshd, items: [order_product:7oi655u9amm0xpr178mg], order_id: 65, payments: [order_payment:sfd7o4d102xlf5hfh60p], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:npav8iopl56h4lmohn4r, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-19T17:28:54.438831148Z', customer: NULL, description: '', discount: NULL, id: order:pdeltyek3d41h4jqkcuo, items: [order_product:dcn02a29s8s4wpmjio1m], order_id: 60, payments: [order_payment:2ldh092zk98tqu6umypk, order_payment:emhe86nydsii0fy8ihpt], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:qck1906jcgz26pwodncz, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-21T18:25:52.431585933Z', customer: NULL, description: '', discount: NULL, id: order:pqbfk2281uzcqc6gufvf, items: [order_product:j3wd3elm8wy7kogjd1wi], order_id: 70, payments: [order_payment:dsfyu0o42jmnsmt5c90k], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-20T07:58:38.679898966Z', customer: NULL, description: '', discount: NULL, id: order:rdmznvsbeg7pzx1oibk9, items: [order_product:b527r73ichsck4pitt40], order_id: 61, payments: [order_payment:4a9u3f2fua5iltlwqy6l], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-21T18:05:13.508766396Z', customer: NULL, description: '', discount: NULL, id: order:uggr1yptvjlrxysw344b, items: [order_product:yeh3enio3ashnzecezi9], order_id: 66, payments: [order_payment:p8nboi0g9rg4y1hdr3sn], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:sxl5miqctgytildw53sn, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-14T20:25:39.122803582Z', customer: NULL, description: '', discount: NULL, id: order:wx1d0e71napi4ku6q0cy, items: [order_product:d0gob6ew8p7picwwx1s2], order_id: 4, payments: [order_payment:5r0bqs9g0ha9fheeqnl4], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-16T14:35:19.632470280Z', customer: NULL, description: '', discount: NULL, id: order:y0pg97wisj80erzxzl45, items: [order_product:1gsan14rpd96nl1op9ce], order_id: 53, payments: [order_payment:gpvv15yrxclb4skfxrrl], returned_from: NULL, status: 'Pending', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:fu918gyvv9twkosjkk9m, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-16T06:37:31.878172703Z', customer: NULL, description: '', discount: NULL, id: order:yjtl8laegz9ngojxrrc2, items: [order_product:109380mfrq89mawp72g5, order_product:xaq93sr09nfznjixs2qg, order_product:iaa52ozy0kep76gagleb], order_id: 6, payments: [order_payment:kmqvnt16yiw2k1m2d5am], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: NULL, terminal: terminal:99xzlze67p8yqelhulha, user: user_account:wh4jdwgbk9e0ajn6tpfn }, { adjustment: 0f, created_at: d'2026-02-09T09:41:16.313696581Z', customer: NULL, description: '', discount: order_discount:b3lkcepzy288mtrq7vv0, id: order:zev8ec7m5r4dz9sfe3cc, items: [order_product:ie9j56breba68kzk6lif], order_id: 1, payments: [order_payment:05kqvijjribvbqie4dew], returned_from: NULL, status: 'Completed', store: store:q4yr0krhgdw4v3wncjft, tax: order_tax:zu5yjbizthachzn7b159, terminal: terminal:j7v7baelzij0efxsjwuz, user: user_account:wh4jdwgbk9e0ajn6tpfn } ];

-- ------------------------------
-- TABLE: order_discount
-- ------------------------------

DEFINE TABLE order_discount TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD amount ON order_discount TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON order_discount TYPE option<datetime | null> DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD rate ON order_discount TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD rate_type ON order_discount TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD type ON order_discount TYPE option<record<discount> | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: order_discount
-- ------------------------------

INSERT [ { amount: 5f, created_at: d'2026-02-09T09:41:16.304824900Z', id: order_discount:b3lkcepzy288mtrq7vv0, rate_type: 'percent', type: discount:ylk15llokt18l8338p5g }, { amount: 5f, created_at: d'2026-02-09T09:37:49.843299327Z', id: order_discount:urhpb8084obquoxdku19, rate_type: 'percent', type: discount:ylk15llokt18l8338p5g } ];

-- ------------------------------
-- TABLE: order_payment
-- ------------------------------

DEFINE TABLE order_payment TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created_at ON order_payment TYPE option<datetime | null> DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD due ON order_payment TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD received ON order_payment TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD total ON order_payment TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD type ON order_payment TYPE option<record<payment> | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: order_payment
-- ------------------------------

INSERT [ { created_at: d'2026-02-09T09:41:16.310984095Z', due: 0f, id: order_payment:05kqvijjribvbqie4dew, received: 1516f, total: 1516f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:24.851960239Z', due: 0f, id: order_payment:06x33ovlju53uw4xybym, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-17T16:08:21.373321442Z', due: 0f, id: order_payment:0zk948d5bkrv17wksf93, received: 100f, total: 100f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-20T10:14:53.197981433Z', due: 0f, id: order_payment:26wqt78ruspwrz55h0ey, received: 42.48f, total: 42.48f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-19T17:28:54.435404969Z', due: -0.0027999999999792635f, id: order_payment:2ldh092zk98tqu6umypk, received: 394.1f, total: 394.1028f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-20T07:58:38.676795556Z', due: 0f, id: order_payment:4a9u3f2fua5iltlwqy6l, received: 169.92f, total: 169.92f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-21T18:02:30.715305491Z', due: 0f, id: order_payment:4wlo8bl4hry6hvx3ya4b, received: 40f, total: 40f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-14T20:25:39.118972852Z', due: 0f, id: order_payment:5r0bqs9g0ha9fheeqnl4, received: 6000f, total: 6000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-22T07:04:36.044229753Z', due: 0f, id: order_payment:5ucox4l6hgzag36jup5d, received: 40f, total: 40f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:27.350763081Z', due: 0f, id: order_payment:5umrxv0c1qm5qvnludud, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T06:41:50.341451080Z', due: 0f, id: order_payment:60x3rmkpj782tmvwyu3f, received: 3861f, total: 3861f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T06:42:52.787772766Z', due: 0f, id: order_payment:6lmj33thyku03o5tcfli, received: 3861f, total: 3861f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-17T14:47:35.459740008Z', due: 0f, id: order_payment:6rrzr6r20dm7oves7r11, received: 13000f, total: 13000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:28.701610527Z', due: 0f, id: order_payment:72mwamy47sncuk94xhvm, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:18:12.833300129Z', due: 0f, id: order_payment:7f6hjporqkdlplihumth, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:35:05.511577974Z', due: 0f, id: order_payment:7fojyqndbhghkgn27ktr, received: 100f, total: 100f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-19T17:21:34.154539848Z', due: 0f, id: order_payment:7jiizp53tj1gwvwvjfql, received: 384f, total: 384f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:15:34.847211136Z', due: 0f, id: order_payment:8eo7d5yzbivggck7fess, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-17T15:26:03.061077360Z', due: 0f, id: order_payment:9cr30jphcmdbi7gs9af7, received: 117f, total: 117f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:22.292260057Z', due: 0f, id: order_payment:9ngpt74qjf684uftmgec, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:31.487818419Z', due: 0f, id: order_payment:9z433gnkxig44u3dk1rt, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:15:45.960282450Z', due: 0f, id: order_payment:a111dk229eav15vjm29r, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:15:36.966119796Z', due: 0f, id: order_payment:agl9qp7tohsu5kriqwqy, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-15T10:43:34.112373186Z', due: 0f, id: order_payment:azk08duxbj7e7fysvmhi, received: 2200f, total: 2200f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:25.007051289Z', due: 0f, id: order_payment:b0ru3qgdb3wqce5iz0ih, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:35:05.516770913Z', due: -200f, id: order_payment:bdxcf8fs7vgbj5uaovz6, received: -100f, total: 100f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:15:48.473595526Z', due: 0f, id: order_payment:bnyy5nv6ej7h559svx0t, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:25.175065704Z', due: 0f, id: order_payment:bvvv3awloy33gkkleu7u, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-21T18:23:32.590321657Z', due: 0f, id: order_payment:c7f3v0iyv5rr5zainuhr, received: 46.8f, total: 46.8f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-21T18:25:52.429470925Z', due: 0f, id: order_payment:dsfyu0o42jmnsmt5c90k, received: 40f, total: 40f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:25:46.095771415Z', due: 0f, id: order_payment:ehljnsz3gc6uq10sdaoo, received: 1100f, total: 1100f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-19T17:28:54.437178046Z', due: -394.1f, id: order_payment:emhe86nydsii0fy8ihpt, received: 0.0027999999999792635f, total: 394.1028f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:35.306117239Z', due: 0f, id: order_payment:esnay4z7h7oml1qbbqsw, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-09T09:37:49.850317234Z', due: 0f, id: order_payment:f8hdrtosjerpzpw1j4w8, received: 1516f, total: 1516f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-21T18:24:38.661503673Z', due: 0f, id: order_payment:gj2fr3w0537ou4pfw7xk, received: 40f, total: 40f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-21T18:26:32.324522924Z', due: 0f, id: order_payment:goid79wdwvs6070feg33, received: 40f, total: 40f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:35:19.630628582Z', due: 0f, id: order_payment:gpvv15yrxclb4skfxrrl, received: 117f, total: 117f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:33:11.426694674Z', due: 0f, id: order_payment:h23odww4wyw44bmtaoch, received: 1170f, total: 1170f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:53.481591593Z', due: 0f, id: order_payment:j1bg5imkktiq6w1ef6ed, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:40.748374899Z', due: 0f, id: order_payment:jvedrudgl0d9s3wv13zn, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:25.366919751Z', due: 0f, id: order_payment:jy6ik7c83n17r1rbo7mr, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:28.251949Z', due: 0f, id: order_payment:kb0er1p7lt0yozkhtvn6, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:31:58.544899913Z', due: 0f, id: order_payment:kf6309765t31zxh6y1pt, received: 1170f, total: 1170f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T06:37:31.876071274Z', due: 0f, id: order_payment:kmqvnt16yiw2k1m2d5am, received: 6700f, total: 6700f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:18:38.938974086Z', due: 0f, id: order_payment:l61wc4oy22pk6h9k1oyy, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:32.272388524Z', due: 0f, id: order_payment:lajxx0lvub0n9723v5jj, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-17T14:48:42.816757682Z', due: 0f, id: order_payment:mgq8cbj7r0wwbwp64suw, received: 117f, total: 117f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-12T14:42:39.209412863Z', due: 0f, id: order_payment:mjpjnfwpkn9kqzk2ijak, received: 100f, total: 100f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-21T17:55:57.345556467Z', due: 0f, id: order_payment:mp3jonb4jcws0196vr00, received: 40f, total: 40f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:29.286920977Z', due: 0f, id: order_payment:n7wah4cmw9r2j88c2o36, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-15T16:58:29.288877046Z', due: 0f, id: order_payment:nxiovk6gz9brms1wmkjn, received: 1287f, total: 1287f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-21T18:05:25.460836064Z', due: 0f, id: order_payment:nzwp0f01vn0psxbzhlr5, received: 46.8f, total: 46.8f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:22:59.752770184Z', due: 0f, id: order_payment:ocql17xixqgeq92q6yrk, received: 1100f, total: 1100f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:34:07.253009798Z', due: 0f, id: order_payment:ol4x54yb66gu066ht4l8, received: 1170f, total: 1170f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:15:47.437042063Z', due: 0f, id: order_payment:p77kk1l91k628of1x3an, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-21T18:05:13.503531869Z', due: 0f, id: order_payment:p8nboi0g9rg4y1hdr3sn, received: 46.8f, total: 46.8f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:32.796457860Z', due: 0f, id: order_payment:pjb39fjrvj5ne76r496e, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:33.845124242Z', due: 0f, id: order_payment:pmo8on361frt2ax2jivo, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T12:48:49.074331339Z', due: 0f, id: order_payment:qlgswbdrhgv0mnjpc33i, received: 100f, total: 100f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:29.733539769Z', due: 0f, id: order_payment:qptl8aiv2980um2h4fzd, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:30.409818299Z', due: 0f, id: order_payment:qv1xumqxq78fyuczoe1l, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:25:53.823031911Z', due: 0f, id: order_payment:r1jjbit8a031shg4kikx, received: 1100f, total: 1100f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:21:12.441754789Z', due: 0f, id: order_payment:rpnfxpo66x3ymniu3zb4, received: 1170f, total: 1170f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:24.663609060Z', due: 0f, id: order_payment:rvnvxf55nnkx2eos8f3m, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:24.502917357Z', due: 0f, id: order_payment:s49gemn8aflrr5drzd5m, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:26.495272440Z', due: 0f, id: order_payment:seb4u8lqxyk8kq44swbs, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-21T18:04:18.416923925Z', due: 0f, id: order_payment:sfd7o4d102xlf5hfh60p, received: 46.8f, total: 46.8f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-22T07:14:25.517198564Z', due: 0f, id: order_payment:t4u51hd19dypdk5ttwwg, received: 46.8f, total: 46.8f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:25.511743927Z', due: 0f, id: order_payment:u6pt9iqgwu09we3d69xw, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:12:00.522213002Z', due: 0f, id: order_payment:uvnzu5bq3f13f782xje7, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:24.351586241Z', due: 0f, id: order_payment:v49jaqow6nlmgpryjqgi, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:32:48.023611655Z', due: 0f, id: order_payment:v6dnxpaw86j9w03tw0n4, received: 100f, total: 100f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T06:41:44.148255704Z', due: 0f, id: order_payment:w26lkziwlkaislmg2fx7, received: 3861f, total: 3861f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:21:56.712062076Z', due: 0f, id: order_payment:w4m05z2i0sji650xoiy0, received: 1100f, total: 1100f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:35:05.514013656Z', due: 0f, id: order_payment:xdc8yklc37785xrwfyk1, received: 100f, total: 100f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-09T11:39:27.464512683Z', due: 0f, id: order_payment:xo9cfjkwo8cr6bh4se6y, received: 2800f, total: 2800f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-17T14:48:07.753811282Z', due: 0f, id: order_payment:yk8naxipzarl1v9tokw8, received: 117f, total: 117f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:17:02.916206803Z', due: 0f, id: order_payment:ynojeml7g2xj2m29r571, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T11:11:01.150630244Z', due: 0f, id: order_payment:zdnrg5ok66ql6t2tnys7, received: 9711f, total: 9711f, type: payment:xlrbwpau2hilzhr3vahs }, { created_at: d'2026-02-16T14:19:34.375724464Z', due: 0f, id: order_payment:zkree4tzd0jxdbu37rge, received: 1000f, total: 1000f, type: payment:xlrbwpau2hilzhr3vahs } ];

-- ------------------------------
-- TABLE: order_product
-- ------------------------------

DEFINE TABLE order_product TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created_at ON order_product TYPE option<datetime | null> DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD discount ON order_product TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD is_deleted ON order_product TYPE option<bool | null> PERMISSIONS FULL;
DEFINE FIELD is_returned ON order_product TYPE option<bool | null> PERMISSIONS FULL;
DEFINE FIELD is_suspended ON order_product TYPE option<bool | null> PERMISSIONS FULL;
DEFINE FIELD order ON order_product TYPE option<record<order> | null> PERMISSIONS FULL;
DEFINE FIELD price ON order_product TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD product ON order_product TYPE record<product> PERMISSIONS FULL;
DEFINE FIELD quantity ON order_product TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD taxes ON order_product TYPE option<array<record<tax>> | null> PERMISSIONS FULL;
DEFINE FIELD taxes[*] ON order_product TYPE record<tax> PERMISSIONS FULL;
DEFINE FIELD variant ON order_product TYPE option<record<product_variant> | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: order_product
-- ------------------------------

INSERT [ { created_at: d'2026-02-15T16:58:29.233272317Z', discount: 0f, id: order_product:07xfep4vdgcd401311gp, is_deleted: false, is_returned: false, is_suspended: false, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-21T18:26:32.307703683Z', discount: 0f, id: order_product:0j274pcgjqu554gccloo, is_deleted: false, is_returned: false, is_suspended: false, order: order:d2vpj1vy6uurti6jehv8, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-20T10:14:53.165038144Z', discount: 0f, id: order_product:0lyjzdqzjzsyeis9g1gz, is_deleted: false, is_returned: false, is_suspended: false, order: order:hpc96jiohnt01ppwjf98, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 0.354f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T06:37:31.853827955Z', discount: 0f, id: order_product:109380mfrq89mawp72g5, is_deleted: false, is_returned: false, is_suspended: false, order: order:yjtl8laegz9ngojxrrc2, price: 1200f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 3f, taxes: [], variant: product_variant:d41es4jol5sdbi1mgwmm }, { created_at: d'2026-02-16T14:15:36.954696721Z', discount: 0f, id: order_product:13895xj7di9b5g7pxww4, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:25:53.805820455Z', discount: 0f, id: order_product:185mw477tpqui9fm9w38, is_deleted: false, is_returned: false, is_suspended: false, price: 1100f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:tth8t147mi6kxvcqx6cr }, { created_at: d'2026-02-16T14:35:19.621194697Z', discount: 0f, id: order_product:1gsan14rpd96nl1op9ce, is_deleted: false, is_returned: false, is_suspended: false, order: order:y0pg97wisj80erzxzl45, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T14:17:02.903030400Z', discount: 0f, id: order_product:1guegfyx20gz1kiiwf23, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T06:42:52.761277519Z', discount: 0f, id: order_product:1nohkwq2wa1dt7okevut, is_deleted: false, is_returned: false, is_suspended: false, order: order:j1s6baj6xagribhe1m8d, price: 1200f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:d41es4jol5sdbi1mgwmm }, { created_at: d'2026-02-16T14:31:58.531232641Z', discount: 0f, id: order_product:41rdg63p6r1xkt6f1h40, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:19:32.786131001Z', discount: 0f, id: order_product:42tw7p9fpx1283lhrnd5, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-21T18:23:32.574367710Z', discount: 0f, id: order_product:4c6c22l1eukebt8hunf0, is_deleted: false, is_returned: false, is_suspended: false, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T06:41:44.125925926Z', discount: 0f, id: order_product:4ii92zk8qshz5pxau2v4, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:15:47.426374398Z', discount: 0f, id: order_product:59isipmzma8emqzsc4s5, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:21:56.695399981Z', discount: 0f, id: order_product:6a98nrmrg0cn0dynpcm6, is_deleted: false, is_returned: false, is_suspended: false, price: 1100f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:tth8t147mi6kxvcqx6cr }, { created_at: d'2026-02-16T14:32:48.000180864Z', discount: 0f, id: order_product:6nfq0uwxnvwiebp6fsm6, is_deleted: false, is_returned: false, is_suspended: false, order: order:78h975dizjvkve6f6zdt, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-15T16:58:29.219628135Z', discount: 0f, id: order_product:6uwtmo48rf232slosfcy, is_deleted: false, is_returned: false, is_suspended: false, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T14:19:34.352975060Z', discount: 0f, id: order_product:79bnds7h4j1vof5qfh8f, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-21T18:04:18.398874791Z', discount: 0f, id: order_product:7oi655u9amm0xpr178mg, is_deleted: false, is_returned: false, is_suspended: false, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T14:19:28.242606343Z', discount: 0f, id: order_product:86z5gckbedaz4px4sk0g, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:18:12.819693591Z', discount: 0f, id: order_product:8cfdz8ttfwsgrriyiqok, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-15T16:58:29.259913479Z', discount: 0f, id: order_product:8rdmsztolmqtkksq9utw, is_deleted: false, is_returned: false, is_suspended: false, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-21T18:24:38.648740583Z', discount: 0f, id: order_product:8tc0u7oyemdmnbp7z3af, is_deleted: false, is_returned: false, is_suspended: false, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-15T16:58:29.201842853Z', discount: 0f, id: order_product:8yydsxj30z4o5r17uqbg, is_deleted: false, is_returned: false, is_suspended: false, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T14:19:25.323503904Z', discount: 0f, id: order_product:9u9t5fewhyxy27wio4yj, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:19:27.336057726Z', discount: 0f, id: order_product:9ypt8ksmswyxibgm052m, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-20T10:14:53.178468193Z', discount: 0f, id: order_product:b502bs2app3susmav1f4, is_deleted: false, is_returned: false, is_suspended: false, order: order:hpc96jiohnt01ppwjf98, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 0.354f, taxes: [], variant: NULL }, { created_at: d'2026-02-20T07:58:38.664547684Z', discount: 0f, id: order_product:b527r73ichsck4pitt40, is_deleted: false, is_returned: false, is_suspended: false, order: order:rdmznvsbeg7pzx1oibk9, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 4.248f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T14:19:25.134905589Z', discount: 0f, id: order_product:chv1c9c0ibt5p4008ztk, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-14T20:25:39.101395932Z', discount: 0f, id: order_product:d0gob6ew8p7picwwx1s2, is_deleted: false, is_returned: false, is_suspended: false, order: order:wx1d0e71napi4ku6q0cy, price: 1200f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 5f, taxes: [], variant: product_variant:d41es4jol5sdbi1mgwmm }, { created_at: d'2026-02-15T16:58:29.242620838Z', discount: 0f, id: order_product:d3u3i3cm8ncv29rk1l58, is_deleted: false, is_returned: false, is_suspended: false, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-19T17:28:54.419561153Z', discount: 0f, id: order_product:dcn02a29s8s4wpmjio1m, is_deleted: false, is_returned: false, is_suspended: false, order: order:pdeltyek3d41h4jqkcuo, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 8.421f, taxes: [], variant: NULL }, { created_at: d'2026-02-15T16:58:29.274951615Z', discount: 0f, id: order_product:dd69h2np3md9cg347a9n, is_deleted: false, is_returned: false, is_suspended: false, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T14:19:24.652391112Z', discount: 0f, id: order_product:dmk8ear3ish5dei4wywg, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:19:30.397228787Z', discount: 0f, id: order_product:e1rcxwof8pkfdt4be4m5, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-17T14:48:42.799376451Z', discount: 0f, id: order_product:e39m8jbta0bd70m420w8, is_deleted: false, is_returned: false, is_suspended: false, order: order:5d9csjclhp18e8h8cdq5, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T14:33:11.411334530Z', discount: 0f, id: order_product:e823h6elpz091ax7bv1a, is_deleted: false, is_returned: false, is_suspended: false, order: order:gp6jwqcec26lca57je80, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:28:11.202941921Z', discount: 0f, id: order_product:e8olwkeylqd9te5lk8pn, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-21T18:05:25.433492763Z', discount: 0f, id: order_product:ekazt1th0a6pagl3u376, is_deleted: false, is_returned: false, is_suspended: false, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T14:18:38.924816814Z', discount: 0f, id: order_product:evgvm3jeps88ewn5iy0s, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:15:34.825534798Z', discount: 0f, id: order_product:ezvz3v595srqnux7ndc2, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:15:48.439742210Z', discount: 0f, id: order_product:gm6ngjcn5v8tcmxn2bif, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-15T10:43:34.098012654Z', discount: 0f, id: order_product:h5ygdex004z23yvzfu7w, is_deleted: false, is_returned: false, is_suspended: false, order: order:ik8c7rwzqrrwr94s0qxh, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:19:32.257355808Z', discount: 0f, id: order_product:h6jne16ynhw1wqggtvfx, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-21T17:55:57.317910046Z', discount: 0f, id: order_product:i8pwzlxqt0aegjkywrt9, is_deleted: false, is_returned: false, is_suspended: false, order: order:3rre5nlf5frmas603kth, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T06:37:31.868028857Z', discount: 0f, id: order_product:iaa52ozy0kep76gagleb, is_deleted: false, is_returned: false, is_suspended: false, order: order:yjtl8laegz9ngojxrrc2, price: 1100f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:tth8t147mi6kxvcqx6cr }, { created_at: d'2026-02-09T09:41:16.297108210Z', discount: 0f, id: order_product:ie9j56breba68kzk6lif, is_deleted: false, is_returned: false, is_suspended: false, order: order:zev8ec7m5r4dz9sfe3cc, price: 1300f, product: product:wy8m4qc43u3we1lmznd4, quantity: 1f, taxes: [tax:cp3kz5kq2tousp3lwvbx], variant: product_variant:ifq5jt5xqelm3xnpvid8 }, { created_at: d'2026-02-16T11:11:01.102455317Z', discount: 0f, id: order_product:ii0nsotvj0gw5g2op2vp, is_deleted: false, is_returned: false, is_suspended: false, order: order:i36e5ajyb78oslgphkjf, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 3f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:19:31.477670906Z', discount: 0f, id: order_product:iu9cyn915xt779ly39sp, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-21T18:25:52.415382134Z', discount: 0f, id: order_product:j3wd3elm8wy7kogjd1wi, is_deleted: false, is_returned: false, is_suspended: false, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-17T16:08:21.339127653Z', discount: 0f, id: order_product:jg492uimxbpmjg5ulz1j, is_deleted: false, is_returned: false, is_suspended: false, order: order:2i1hasqwjwn0l1uqpenz, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-15T16:58:29.211791356Z', discount: 0f, id: order_product:k7zf0ssrsq17pvd9uog3, is_deleted: false, is_returned: false, is_suspended: false, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T06:41:44.134815385Z', discount: 0f, id: order_product:kbsx489dmikrsjppr9wx, is_deleted: false, is_returned: false, is_suspended: false, price: 1100f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:tth8t147mi6kxvcqx6cr }, { created_at: d'2026-02-16T11:11:01.125425273Z', discount: 0f, id: order_product:l6ic47gukr3uc38prwv7, is_deleted: false, is_returned: false, is_suspended: false, order: order:i36e5ajyb78oslgphkjf, price: 1200f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 3f, taxes: [], variant: product_variant:d41es4jol5sdbi1mgwmm }, { created_at: d'2026-02-16T14:35:05.497332790Z', discount: 0f, id: order_product:lb8cw0dwbxk2czl63mnp, is_deleted: false, is_returned: false, is_suspended: false, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T06:41:44.114482808Z', discount: 0f, id: order_product:mt1jcqaqhckz8f79ejnq, is_deleted: false, is_returned: false, is_suspended: false, price: 1200f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:d41es4jol5sdbi1mgwmm }, { created_at: d'2026-02-16T14:19:24.338854774Z', discount: 0f, id: order_product:mt8kb67aa618dt3oaht1, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T06:41:50.316506146Z', discount: 0f, id: order_product:n7ojvz8w2flokkpx9u8t, is_deleted: false, is_returned: false, is_suspended: false, price: 1200f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:d41es4jol5sdbi1mgwmm }, { created_at: d'2026-02-16T14:19:53.469771744Z', discount: 0f, id: order_product:o4njxarx5n04h2z6avse, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-09T11:39:27.458849751Z', discount: 0f, id: order_product:o8p38yci6vc86xb71lpk, is_deleted: false, is_returned: false, is_suspended: false, order: order:9fpbzv1gpi06mj44f82q, price: 1300f, product: product:wy8m4qc43u3we1lmznd4, quantity: 1f, taxes: [tax:cp3kz5kq2tousp3lwvbx], variant: product_variant:ifq5jt5xqelm3xnpvid8 }, { created_at: d'2026-02-16T14:22:59.742614177Z', discount: 0f, id: order_product:oiiu7cu0eyaxf5mjcs9s, is_deleted: false, is_returned: false, is_suspended: false, order: order:2ietbys38cfzcnksxmer, price: 1100f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:tth8t147mi6kxvcqx6cr }, { created_at: d'2026-02-15T16:58:29.187918360Z', discount: 0f, id: order_product:okayw08l4oqm4hqd3w00, is_deleted: false, is_returned: false, is_suspended: false, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T14:19:40.735060124Z', discount: 0f, id: order_product:ovrfcwma3ppcpa2k7xr0, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:19:35.267253216Z', discount: 0f, id: order_product:owni8rin8gygc2lm5wx4, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T06:41:50.331196358Z', discount: 0f, id: order_product:p0e6fiy872f88a0ylirv, is_deleted: false, is_returned: false, is_suspended: false, price: 1100f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:tth8t147mi6kxvcqx6cr }, { created_at: d'2026-02-15T10:43:34.105471214Z', discount: 0f, id: order_product:pfi13k0uc8y9487jff9v, is_deleted: false, is_returned: false, is_suspended: false, order: order:ik8c7rwzqrrwr94s0qxh, price: 1200f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:d41es4jol5sdbi1mgwmm }, { created_at: d'2026-02-17T14:48:07.736690005Z', discount: 0f, id: order_product:ppmp2602oyyxmo6c24er, is_deleted: false, is_returned: false, is_suspended: false, order: order:3q8c0hdioqgp3dhf8rku, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T14:19:29.722549354Z', discount: 0f, id: order_product:prond17n5wprkgk8v730, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-19T17:21:34.131265816Z', discount: 0f, id: order_product:prub197hz9b6dunavvhs, is_deleted: false, is_returned: false, is_suspended: false, order: order:6cwkh4tp7erdm7zsvtms, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 9.6f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T11:11:01.115490470Z', discount: 0f, id: order_product:ptcwd5k34qu3aoo2mx7p, is_deleted: false, is_returned: false, is_suspended: false, order: order:i36e5ajyb78oslgphkjf, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 6f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T12:48:49.058307128Z', discount: 0f, id: order_product:qe8ny6cs7aafgj8f5jro, is_deleted: false, is_returned: false, is_suspended: false, order: order:clsp9rwtisqesagli3it, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-15T16:58:29.266414137Z', discount: 0f, id: order_product:qj2sln3r8vgxehncnm13, is_deleted: false, is_returned: false, is_suspended: false, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-21T18:02:30.700558368Z', discount: 0f, id: order_product:r05fl6gx5jhtio4bj3hf, is_deleted: false, is_returned: false, is_suspended: false, order: order:iue4gw690mh6vkoexa4e, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-15T16:58:29.253171766Z', discount: 0f, id: order_product:r41gzr7iw9w99oub4sfk, is_deleted: false, is_returned: false, is_suspended: false, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T14:19:28.691334475Z', discount: 0f, id: order_product:rb7pwvtoh52lzeffvkd9, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:21:12.426230309Z', discount: 0f, id: order_product:reyay7o9jo3653khsicc, is_deleted: false, is_returned: false, is_suspended: false, order: order:fkcnegr9iwjiuxweyjmx, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-22T07:14:25.456867805Z', discount: 0f, id: order_product:s22wenipxtuusvm7mgow, is_deleted: false, is_returned: false, is_suspended: false, order: order:aj0nrxl9ln3wsxht4fv1, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T14:19:26.477266330Z', discount: 0f, id: order_product:sbo5mdaml5rgxijujdz5, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-22T07:04:36.031987641Z', discount: 0f, id: order_product:sreyz804xl5ju400cqw0, is_deleted: false, is_returned: false, is_suspended: false, order: order:bxo52bviul6f4nhqpa53, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T14:19:24.490875392Z', discount: 0f, id: order_product:t1uxztk8ozu3bn3bnq8w, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T06:41:50.323955911Z', discount: 0f, id: order_product:tcfwqmr71vno1pjijsl5, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-17T14:47:35.444448149Z', discount: 0f, id: order_product:ugmpe7sbl8rlozln0b6x, is_deleted: false, is_returned: false, is_suspended: false, order: order:gxw9fv46ccox482k9vxz, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 13f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:19:25.480435824Z', discount: 0f, id: order_product:uj86wbnkg76pi8uom8eh, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-12T14:42:39.195331955Z', discount: 0f, id: order_product:urikws4l5d6del3k5tsq, is_deleted: false, is_returned: false, is_suspended: false, order: order:kszqp53g8taa2u9639mh, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-09T11:39:27.455712164Z', discount: 0f, id: order_product:uvfedfv939w0pqcmekzp, is_deleted: false, is_returned: false, is_suspended: false, order: order:9fpbzv1gpi06mj44f82q, price: 1500f, product: product:wy8m4qc43u3we1lmznd4, quantity: 1f, taxes: [tax:cp3kz5kq2tousp3lwvbx], variant: product_variant:hts3qymce4g7rleek8t9 }, { created_at: d'2026-02-16T14:19:24.973796613Z', discount: 0f, id: order_product:vml6vkuj7si6p2pjsosk, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-09T09:37:49.834931854Z', discount: 0f, id: order_product:vy79cptgjc7xoad9z9bi, is_deleted: false, is_returned: false, is_suspended: false, price: 1300f, product: product:wy8m4qc43u3we1lmznd4, quantity: 1f, taxes: [tax:cp3kz5kq2tousp3lwvbx], variant: product_variant:ifq5jt5xqelm3xnpvid8 }, { created_at: d'2026-02-16T06:42:52.771277693Z', discount: 0f, id: order_product:weoyeldo599qgawe2hje, is_deleted: false, is_returned: false, is_suspended: false, order: order:j1s6baj6xagribhe1m8d, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-17T15:26:03.046772208Z', discount: 0f, id: order_product:wfy5em2zl1ru5l9pjqgf, is_deleted: false, is_returned: false, is_suspended: false, order: order:930vba19vabhl7tv9a0x, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T14:19:29.275010282Z', discount: 0f, id: order_product:wyzd8p3pml3zjtrqgc0u, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T06:37:31.862203772Z', discount: 0f, id: order_product:xaq93sr09nfznjixs2qg, is_deleted: false, is_returned: false, is_suspended: false, order: order:yjtl8laegz9ngojxrrc2, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 2f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:19:24.824853219Z', discount: 0f, id: order_product:xi0ol8ihpchqnko9a9g6, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:19:22.277618471Z', discount: 0f, id: order_product:xvjt4ukmvm8ryyn8lx4q, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:15:45.947994863Z', discount: 0f, id: order_product:xz36b1v5ayd5blnzbx58, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:25:46.078458936Z', discount: 0f, id: order_product:y1zqvljhnz87olg5vxex, is_deleted: false, is_returned: false, is_suspended: false, price: 1100f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:tth8t147mi6kxvcqx6cr }, { created_at: d'2026-02-16T14:19:33.835424156Z', discount: 0f, id: order_product:y76ebai8et29slbdt0vs, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T14:12:00.512741351Z', discount: 0f, id: order_product:y7xaddyvvzuzm0rm7e3k, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-20T10:14:53.187237151Z', discount: 0f, id: order_product:yazggatilgd7jdjf5m8u, is_deleted: false, is_returned: false, is_suspended: false, order: order:hpc96jiohnt01ppwjf98, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 0.354f, taxes: [], variant: NULL }, { created_at: d'2026-02-21T18:05:13.477602103Z', discount: 0f, id: order_product:yeh3enio3ashnzecezi9, is_deleted: false, is_returned: false, is_suspended: false, price: 40f, product: product:u1l0zeuqchsifal0p9r8, quantity: 1f, taxes: [], variant: NULL }, { created_at: d'2026-02-16T06:42:52.777730155Z', discount: 0f, id: order_product:yyce6eaumydf76v22zxc, is_deleted: false, is_returned: false, is_suspended: false, order: order:j1s6baj6xagribhe1m8d, price: 1100f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:tth8t147mi6kxvcqx6cr }, { created_at: d'2026-02-16T11:11:01.135169712Z', discount: 0f, id: order_product:yynxxj68i6jlx6ap9j0u, is_deleted: false, is_returned: false, is_suspended: false, order: order:i36e5ajyb78oslgphkjf, price: 1100f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:tth8t147mi6kxvcqx6cr }, { created_at: d'2026-02-16T14:34:07.241144043Z', discount: 0f, id: order_product:zlxy4p64rkfn38wm2ic8, is_deleted: false, is_returned: false, is_suspended: false, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, quantity: 1f, taxes: [], variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-15T16:58:29.226904832Z', discount: 0f, id: order_product:znuxvtur4nr71l2lll2r, is_deleted: false, is_returned: false, is_suspended: false, price: 100f, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, taxes: [], variant: NULL } ];

-- ------------------------------
-- TABLE: order_tax
-- ------------------------------

DEFINE TABLE order_tax TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD amount ON order_tax TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON order_tax TYPE option<datetime | null> DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD rate ON order_tax TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD type ON order_tax TYPE option<record<tax> | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: order_tax
-- ------------------------------

INSERT [ { amount: 0f, created_at: d'2026-02-16T14:33:11.423820299Z', id: order_tax:063k006v85jwhuuxo8ek, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-16T06:42:52.783678796Z', id: order_tax:38t5wboymcl33jndohd2, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-17T15:26:03.057236207Z', id: order_tax:3bkegp227k7cwii6v2md, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-09T09:37:49.845790258Z', id: order_tax:3uknmi0zh005eu88y11h, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-16T06:41:44.142397317Z', id: order_tax:4vcenj1q567nc69qt9ue, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-16T14:34:07.249415781Z', id: order_tax:8wpqsbqlaclrdjc1tekm, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-22T07:14:25.504971625Z', id: order_tax:cqaccy1hruo8w029m0s1, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-16T14:35:19.627603778Z', id: order_tax:fu918gyvv9twkosjkk9m, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-21T18:23:32.585636095Z', id: order_tax:gkndv9nk853q8j2vqbt9, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-16T14:31:58.541302346Z', id: order_tax:kp7fdxyrlj3dtt88plsv, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-17T14:48:42.812860983Z', id: order_tax:mdygkrswwd3jg6l3ds2u, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-16T14:21:12.436874489Z', id: order_tax:mlixs3v9pcno3yggkdzt, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-21T18:04:18.412348599Z', id: order_tax:npav8iopl56h4lmohn4r, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-19T17:28:54.432047249Z', id: order_tax:qck1906jcgz26pwodncz, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-21T18:05:13.495301892Z', id: order_tax:sxl5miqctgytildw53sn, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-21T18:05:25.454323313Z', id: order_tax:t9ulbebfi3xahtbdwr5g, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-15T16:58:29.282846948Z', id: order_tax:vyfb6p062x2hlpz3gtqw, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-16T06:41:50.337689749Z', id: order_tax:wx59nwps0u53toj7wy9e, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-16T11:11:01.143212816Z', id: order_tax:x05enwb3dyd7o24c1vtn, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-17T14:48:07.749346322Z', id: order_tax:z15qp9h6eleqd5rhovf9, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx }, { amount: 0f, created_at: d'2026-02-09T09:41:16.306230519Z', id: order_tax:zu5yjbizthachzn7b159, rate: 17f, type: tax:cp3kz5kq2tousp3lwvbx } ];

-- ------------------------------
-- TABLE: payment
-- ------------------------------

DEFINE TABLE payment TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD can_have_change_due ON payment TYPE option<bool | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON payment TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD is_active ON payment TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD name ON payment TYPE string PERMISSIONS FULL;
DEFINE FIELD stores ON payment TYPE array<record<store>> PERMISSIONS FULL;
DEFINE FIELD stores[*] ON payment TYPE record<store> PERMISSIONS FULL;
DEFINE FIELD type ON payment TYPE string PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: payment
-- ------------------------------

INSERT [ { can_have_change_due: true, id: payment:xlrbwpau2hilzhr3vahs, is_active: true, name: 'cash', stores: [store:ejrxrfl3bs3q3z0gtbri, store:nlh64knntpdopce0aq7l, store:q4yr0krhgdw4v3wncjft], type: 'cash' } ];

-- ------------------------------
-- TABLE: printer
-- ------------------------------

DEFINE TABLE printer TYPE ANY SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD ip_address ON printer TYPE string PERMISSIONS FULL;
DEFINE FIELD name ON printer TYPE string PERMISSIONS FULL;
DEFINE FIELD port ON printer TYPE option<int | null> PERMISSIONS FULL;
DEFINE FIELD prints ON printer TYPE int PERMISSIONS FULL;
DEFINE FIELD priority ON printer TYPE option<int | null> PERMISSIONS FULL;
DEFINE FIELD store ON printer TYPE record<store> PERMISSIONS FULL;
DEFINE FIELD type ON printer TYPE option<string | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: printer
-- ------------------------------

INSERT [ { id: printer:58pmbbhsaj6aa7ni7hwc, ip_address: '192.168.1.100', name: 'Printer 1', port: 9100, prints: 1, priority: 1, store: store:q4yr0krhgdw4v3wncjft, type: 'Network' }, { id: printer:apk3vtc2khtoqdh4doe2, ip_address: '192.168.1.101', name: 'Printer 2', port: 9100, prints: 1, priority: 2, store: store:q4yr0krhgdw4v3wncjft, type: 'Network' } ];

-- ------------------------------
-- TABLE: product
-- ------------------------------

DEFINE TABLE product TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD attributes ON product TYPE option<array<record<product_attribute>> | null> PERMISSIONS FULL;
DEFINE FIELD attributes[*] ON product TYPE record<product_attribute> PERMISSIONS FULL;
DEFINE FIELD barcode ON product TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD base_price ON product TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD base_quantity ON product TYPE option<int | null> PERMISSIONS FULL;
DEFINE FIELD brands ON product TYPE option<array<record<brand>> | null> PERMISSIONS FULL;
DEFINE FIELD brands[*] ON product TYPE record<brand> PERMISSIONS FULL;
DEFINE FIELD categories ON product TYPE option<array<record<category>> | null> PERMISSIONS FULL;
DEFINE FIELD categories[*] ON product TYPE record<category> PERMISSIONS FULL;
DEFINE FIELD cost ON product TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON product TYPE option<datetime | null> DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD department ON product TYPE option<record<department> | null> PERMISSIONS FULL;
DEFINE FIELD inventory_method ON product TYPE option<string | null> DEFAULT fifo PERMISSIONS FULL;
DEFINE FIELD is_active ON product TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD is_available ON product TYPE option<bool | null> PERMISSIONS FULL;
DEFINE FIELD is_expire ON product TYPE option<bool | null> VALUE false PERMISSIONS FULL;
DEFINE FIELD manage_inventory ON product TYPE option<bool | null> PERMISSIONS FULL;
DEFINE FIELD media ON product TYPE option<record<media> | null> PERMISSIONS FULL;
DEFINE FIELD name ON product TYPE string PERMISSIONS FULL;
DEFINE FIELD prices ON product TYPE option<array<record<product_price>> | null> PERMISSIONS FULL;
DEFINE FIELD prices[*] ON product TYPE record<product_price> PERMISSIONS FULL;
DEFINE FIELD purchase_unit ON product TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD quantity ON product TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD sale_unit ON product TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD sku ON product TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD stores ON product TYPE option<array<record<product_store>> | null> PERMISSIONS FULL;
DEFINE FIELD stores[*] ON product TYPE record<product_store> PERMISSIONS FULL;
DEFINE FIELD suppliers ON product TYPE option<array<record<supplier>> | null> PERMISSIONS FULL;
DEFINE FIELD suppliers[*] ON product TYPE record<supplier> PERMISSIONS FULL;
DEFINE FIELD taxes ON product TYPE option<array<record<tax>> | null> PERMISSIONS FULL;
DEFINE FIELD taxes[*] ON product TYPE record<tax> PERMISSIONS FULL;
DEFINE FIELD terminals ON product TYPE option<array<record<terminal>> | null> PERMISSIONS FULL;
DEFINE FIELD terminals[*] ON product TYPE record<terminal> PERMISSIONS FULL;
DEFINE FIELD variants ON product TYPE option<array<record<product_variant>> | null> PERMISSIONS FULL;
DEFINE FIELD variants[*] ON product TYPE record<product_variant> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: product
-- ------------------------------

INSERT [ { barcode: '8069397252', base_price: 0f, base_quantity: 1, brands: [brand:8kty87fap8zlogdw5d7u], categories: [category:x3dl9poz2bmykna9iytt], cost: 0f, created_at: d'2026-02-14T07:46:00.969084153Z', department: department:33osspfyit3vv5biq29n, id: product:ipf29wf0h3nzvao7vs3y, is_active: true, is_available: true, is_expire: false, manage_inventory: true, name: 'shirt', prices: [], purchase_unit: 'p', quantity: NaN, sale_unit: 'p', stores: [product_store:cxf0de1l5sbfoac7q1cb, product_store:i5e87zqv4vf7ruk0b18s, product_store:702pyc6m1l50ix573ua0], suppliers: [supplier:c8hssetq4s0gbvtotdj9], taxes: [], terminals: [terminal:99xzlze67p8yqelhulha, terminal:j7v7baelzij0efxsjwuz], variants: [product_variant:d41es4jol5sdbi1mgwmm, product_variant:c9scluv6l9lqcewchccz, product_variant:tth8t147mi6kxvcqx6cr] }, { barcode: '4848118345', base_price: 100f, base_quantity: 1, brands: [brand:8kty87fap8zlogdw5d7u], categories: [category:5unry6ehuqav0nsglywo], cost: 80f, created_at: d'2026-02-11T17:37:34.993979841Z', department: department:33osspfyit3vv5biq29n, id: product:kad8ilvog96sm8d8s2u7, is_active: true, is_available: true, is_expire: false, manage_inventory: true, name: 'hat', prices: [], purchase_unit: 'pc', quantity: NaN, sale_unit: 'pc', stores: [product_store:qg11ftjqkfd38rk5rs61, product_store:v447oy1riq7610itsxxy, product_store:71dee0sbhu8anfix2tfm], suppliers: [supplier:c8hssetq4s0gbvtotdj9], taxes: [], terminals: [terminal:99xzlze67p8yqelhulha, terminal:j7v7baelzij0efxsjwuz], variants: [] }, { barcode: '00547', base_price: 40f, base_quantity: 1, brands: [brand:d8jasehpabtfh3ijcr5o], categories: [category:m7hxmspxm4qpw7h6xzyq], cost: 29f, created_at: d'2026-02-19T15:58:13.412189533Z', department: department:onvprzmbzjpo6ghyniv7, id: product:u1l0zeuqchsifal0p9r8, is_active: true, is_available: true, is_expire: false, manage_inventory: true, name: 'onion', prices: [], purchase_unit: 'kg', quantity: NaN, sale_unit: 'kg', stores: [product_store:de41fk3quaxbo01y5l6h, product_store:jstw02pqjbzqhtltn37i, product_store:jczwf98nvqdyhtcqfz51], suppliers: [supplier:c8hssetq4s0gbvtotdj9], taxes: [], terminals: [terminal:99xzlze67p8yqelhulha, terminal:j7v7baelzij0efxsjwuz], variants: [] } ];

-- ------------------------------
-- TABLE: product_attribute
-- ------------------------------

DEFINE TABLE product_attribute TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD `value` ON product_attribute FLEXIBLE TYPE any PERMISSIONS FULL;
DEFINE FIELD index_on_search ON product_attribute TYPE option<bool | null> PERMISSIONS FULL;
DEFINE FIELD title ON product_attribute TYPE string PERMISSIONS FULL;
DEFINE FIELD type ON product_attribute TYPE string PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: product_attribute
-- ------------------------------


-- ------------------------------
-- TABLE: product_inventory
-- ------------------------------

DEFINE TABLE product_inventory TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD entity ON product_inventory TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD entity_type ON product_inventory TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD product ON product_inventory TYPE record<product> PERMISSIONS FULL;
DEFINE FIELD quantity ON product_inventory TYPE float PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: product_inventory
-- ------------------------------


-- ------------------------------
-- TABLE: product_price
-- ------------------------------

DEFINE TABLE product_price TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD base_price ON product_price TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD base_quantity ON product_price TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON product_price TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD date ON product_price TYPE option<int | null> PERMISSIONS FULL;
DEFINE FIELD day ON product_price TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD max_quantity ON product_price TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD min_quantity ON product_price TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD month ON product_price TYPE option<int | null> PERMISSIONS FULL;
DEFINE FIELD product ON product_price TYPE record<product> PERMISSIONS FULL;
DEFINE FIELD product_variant ON product_price TYPE option<record<product_variant> | null> PERMISSIONS FULL;
DEFINE FIELD quarter ON product_price TYPE option<int | null> PERMISSIONS FULL;
DEFINE FIELD rate ON product_price TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD time ON product_price TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD time_to ON product_price TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD week ON product_price TYPE option<int | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: product_price
-- ------------------------------


-- ------------------------------
-- TABLE: product_store
-- ------------------------------

DEFINE TABLE product_store TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD location ON product_store TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD product ON product_store TYPE option<record<product> | null> PERMISSIONS FULL;
DEFINE FIELD quantity ON product_store TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD re_order_level ON product_store TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD store ON product_store TYPE record<store> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: product_store
-- ------------------------------

INSERT [ { id: product_store:702pyc6m1l50ix573ua0, product: product:ipf29wf0h3nzvao7vs3y, quantity: 10f, re_order_level: 1f, store: store:q4yr0krhgdw4v3wncjft }, { id: product_store:71dee0sbhu8anfix2tfm, product: product:kad8ilvog96sm8d8s2u7, quantity: -14f, re_order_level: 1f, store: store:q4yr0krhgdw4v3wncjft }, { id: product_store:cxf0de1l5sbfoac7q1cb, product: product:ipf29wf0h3nzvao7vs3y, quantity: 10f, re_order_level: 1f, store: store:ejrxrfl3bs3q3z0gtbri }, { id: product_store:de41fk3quaxbo01y5l6h, product: product:u1l0zeuqchsifal0p9r8, quantity: 100f, re_order_level: 1f, store: store:ejrxrfl3bs3q3z0gtbri }, { id: product_store:f48iee6yuzxigcqs14dr, product: product:oc8wed7v1ossnfrww1bl, quantity: 10f, re_order_level: 1f, store: store:q4yr0krhgdw4v3wncjft }, { id: product_store:i5e87zqv4vf7ruk0b18s, product: product:ipf29wf0h3nzvao7vs3y, quantity: 10f, re_order_level: 1f, store: store:nlh64knntpdopce0aq7l }, { id: product_store:jczwf98nvqdyhtcqfz51, product: product:u1l0zeuqchsifal0p9r8, quantity: 45.66900000000001f, re_order_level: 1f, store: store:q4yr0krhgdw4v3wncjft }, { id: product_store:jstw02pqjbzqhtltn37i, product: product:u1l0zeuqchsifal0p9r8, quantity: 0f, re_order_level: 1f, store: store:nlh64knntpdopce0aq7l }, { id: product_store:qg11ftjqkfd38rk5rs61, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, re_order_level: 1f, store: store:ejrxrfl3bs3q3z0gtbri }, { id: product_store:r1bl6aakysgkqoz4budl, product: product:oc8wed7v1ossnfrww1bl, quantity: 10f, re_order_level: 1f, store: store:nlh64knntpdopce0aq7l }, { id: product_store:v447oy1riq7610itsxxy, product: product:kad8ilvog96sm8d8s2u7, quantity: 1f, re_order_level: 1f, store: store:nlh64knntpdopce0aq7l }, { id: product_store:xalrsevyz80zdphefdel, product: product:oc8wed7v1ossnfrww1bl, quantity: 10f, re_order_level: 1f, store: store:ejrxrfl3bs3q3z0gtbri } ];

-- ------------------------------
-- TABLE: product_variant
-- ------------------------------

DEFINE TABLE product_variant TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD attribute_name ON product_variant TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD attribute_value ON product_variant TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD barcode ON product_variant TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD cost ON product_variant TYPE option<float | null> DEFAULT 0 PERMISSIONS FULL;
DEFINE FIELD created_at ON product_variant TYPE option<datetime | null> DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD name ON product_variant TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD price ON product_variant TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD prices ON product_variant TYPE option<array<record<product_price>> | null> PERMISSIONS FULL;
DEFINE FIELD prices[*] ON product_variant TYPE record<product_price> PERMISSIONS FULL;
DEFINE FIELD product ON product_variant TYPE option<record<product> | null> PERMISSIONS FULL;
DEFINE FIELD quantity ON product_variant TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD sku ON product_variant TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD stores ON product_variant TYPE option<array<record<product_variant_store>> | null> PERMISSIONS FULL;
DEFINE FIELD stores[*] ON product_variant TYPE record<product_variant_store> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: product_variant
-- ------------------------------

INSERT [ { attribute_value: 'sm', barcode: '80693972522', cost: 600f, created_at: d'2026-02-14T07:46:00.952731278Z', id: product_variant:c9scluv6l9lqcewchccz, price: 1000f, product: product:ipf29wf0h3nzvao7vs3y, stores: [product_variant_store:x4xptcxhr1qqvvl77pj0, product_variant_store:1giv891njwxyb1g9fhhu, product_variant_store:t39apj1s202w9luv0qt7] }, { attribute_value: 'xl', barcode: '80693972521', cost: 600f, created_at: d'2026-02-14T07:46:00.915205328Z', id: product_variant:d41es4jol5sdbi1mgwmm, price: 1200f, product: product:ipf29wf0h3nzvao7vs3y, stores: [product_variant_store:t83q16earnaxo86bg0az, product_variant_store:1yxlz49hfoq001tfe6ml, product_variant_store:3rhcyldjbcyeqdhjt3oa] }, { attribute_value: 'md', barcode: '80693972523', cost: 600f, created_at: d'2026-02-14T07:46:00.959456591Z', id: product_variant:tth8t147mi6kxvcqx6cr, price: 1100f, product: product:ipf29wf0h3nzvao7vs3y, stores: [product_variant_store:1zfe072xa0zt8elgqa3i, product_variant_store:kraqdsjg2knjj8910vi8, product_variant_store:kbc5hxvluuet2v1yf785] } ];

-- ------------------------------
-- TABLE: product_variant_store
-- ------------------------------

DEFINE TABLE product_variant_store TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD location ON product_variant_store TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD product ON product_variant_store TYPE option<record<product> | null> PERMISSIONS FULL;
DEFINE FIELD quantity ON product_variant_store TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD re_order_level ON product_variant_store TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD store ON product_variant_store TYPE record<store> PERMISSIONS FULL;
DEFINE FIELD variant ON product_variant_store TYPE option<record<product_variant> | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: product_variant_store
-- ------------------------------

INSERT [ { id: product_variant_store:1giv891njwxyb1g9fhhu, product: product:ipf29wf0h3nzvao7vs3y, quantity: 10f, re_order_level: 1f, store: store:nlh64knntpdopce0aq7l, variant: product_variant:c9scluv6l9lqcewchccz }, { id: product_variant_store:1yxlz49hfoq001tfe6ml, product: product:ipf29wf0h3nzvao7vs3y, quantity: 10f, re_order_level: 1f, store: store:nlh64knntpdopce0aq7l, variant: product_variant:d41es4jol5sdbi1mgwmm }, { id: product_variant_store:1zfe072xa0zt8elgqa3i, product: product:ipf29wf0h3nzvao7vs3y, quantity: 10f, re_order_level: 1f, store: store:ejrxrfl3bs3q3z0gtbri, variant: product_variant:tth8t147mi6kxvcqx6cr }, { id: product_variant_store:22jmx6tjwt64boe9mr1y, product: product:oc8wed7v1ossnfrww1bl, quantity: 10f, re_order_level: 1f, store: store:ejrxrfl3bs3q3z0gtbri, variant: product_variant:8v16a485ldefzdf9ord0 }, { id: product_variant_store:2n7ln1qc2ooik7sumps7, product: product:oc8wed7v1ossnfrww1bl, quantity: 10f, re_order_level: 1f, store: store:nlh64knntpdopce0aq7l, variant: product_variant:p5bt6lm6htdsj8ql6d5f }, { id: product_variant_store:3rhcyldjbcyeqdhjt3oa, product: product:ipf29wf0h3nzvao7vs3y, quantity: 5f, re_order_level: 1f, store: store:q4yr0krhgdw4v3wncjft, variant: product_variant:d41es4jol5sdbi1mgwmm }, { id: product_variant_store:4ffwb2dyqsm7jd0vw3kg, product: product:oc8wed7v1ossnfrww1bl, quantity: 10f, re_order_level: 1f, store: store:ejrxrfl3bs3q3z0gtbri, variant: product_variant:zs9rr0dorg8ntlpv8vpz }, { id: product_variant_store:4u6jgpb2ns4xms9bi653, product: product:oc8wed7v1ossnfrww1bl, quantity: 10f, re_order_level: 1f, store: store:nlh64knntpdopce0aq7l, variant: product_variant:zs9rr0dorg8ntlpv8vpz }, { id: product_variant_store:8d02nhn6l9qgy95db1yh, product: product:oc8wed7v1ossnfrww1bl, quantity: 10f, re_order_level: 1f, store: store:q4yr0krhgdw4v3wncjft, variant: product_variant:p5bt6lm6htdsj8ql6d5f }, { id: product_variant_store:kbc5hxvluuet2v1yf785, product: product:ipf29wf0h3nzvao7vs3y, quantity: 11f, re_order_level: 1f, store: store:q4yr0krhgdw4v3wncjft, variant: product_variant:tth8t147mi6kxvcqx6cr }, { id: product_variant_store:kraqdsjg2knjj8910vi8, product: product:ipf29wf0h3nzvao7vs3y, quantity: 10f, re_order_level: 1f, store: store:nlh64knntpdopce0aq7l, variant: product_variant:tth8t147mi6kxvcqx6cr }, { id: product_variant_store:m5ttrd8cltkqy2vd4eor, product: product:oc8wed7v1ossnfrww1bl, quantity: 10f, re_order_level: 1f, store: store:nlh64knntpdopce0aq7l, variant: product_variant:8v16a485ldefzdf9ord0 }, { id: product_variant_store:t39apj1s202w9luv0qt7, product: product:ipf29wf0h3nzvao7vs3y, quantity: -40f, re_order_level: 1f, store: store:q4yr0krhgdw4v3wncjft, variant: product_variant:c9scluv6l9lqcewchccz }, { id: product_variant_store:t83q16earnaxo86bg0az, product: product:ipf29wf0h3nzvao7vs3y, quantity: 10f, re_order_level: 1f, store: store:ejrxrfl3bs3q3z0gtbri, variant: product_variant:d41es4jol5sdbi1mgwmm }, { id: product_variant_store:t8t1bhbcfse7cu5oe53e, product: product:oc8wed7v1ossnfrww1bl, quantity: 10f, re_order_level: 1f, store: store:q4yr0krhgdw4v3wncjft, variant: product_variant:8v16a485ldefzdf9ord0 }, { id: product_variant_store:tumkf3calhcj6fg7msyh, product: product:oc8wed7v1ossnfrww1bl, quantity: 10f, re_order_level: 1f, store: store:ejrxrfl3bs3q3z0gtbri, variant: product_variant:p5bt6lm6htdsj8ql6d5f }, { id: product_variant_store:x4xptcxhr1qqvvl77pj0, product: product:ipf29wf0h3nzvao7vs3y, quantity: 10f, re_order_level: 1f, store: store:ejrxrfl3bs3q3z0gtbri, variant: product_variant:c9scluv6l9lqcewchccz }, { id: product_variant_store:zkgdu3ehj2qh54usf8qt, product: product:oc8wed7v1ossnfrww1bl, quantity: 10f, re_order_level: 1f, store: store:q4yr0krhgdw4v3wncjft, variant: product_variant:zs9rr0dorg8ntlpv8vpz } ];

-- ------------------------------
-- TABLE: purchase
-- ------------------------------

DEFINE TABLE purchase TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created_at ON purchase TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD deleted_at ON purchase TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD items ON purchase TYPE array<record<purchase_item>> PERMISSIONS FULL;
DEFINE FIELD items[*] ON purchase TYPE record<purchase_item> PERMISSIONS FULL;
DEFINE FIELD payment_type ON purchase TYPE option<record<payment> | null> PERMISSIONS FULL;
DEFINE FIELD purchase_mode ON purchase TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD purchase_number ON purchase TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD purchase_order ON purchase TYPE option<record<purchase_order> | null> PERMISSIONS FULL;
DEFINE FIELD purchased_by ON purchase TYPE record<user_account> PERMISSIONS FULL;
DEFINE FIELD store ON purchase TYPE record<store> PERMISSIONS FULL;
DEFINE FIELD supplier ON purchase TYPE option<record<supplier> | null> PERMISSIONS FULL;
DEFINE FIELD update_price ON purchase TYPE option<bool | null> PERMISSIONS FULL;
DEFINE FIELD update_stocks ON purchase TYPE option<bool | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: purchase
-- ------------------------------

INSERT [ { created_at: d'2026-02-12T04:57:00Z', id: purchase:a2zfyioy2pgv2fxh6vxg, items: [purchase_item:ppsqtn32sskvb3gxb2fa], payment_type: payment:xlrbwpau2hilzhr3vahs, purchase_mode: 'Purchase order', purchase_number: '1', purchase_order: purchase_order:rccfd5k1mknf07dsbfu9, purchased_by: user_account:wh4jdwgbk9e0ajn6tpfn, store: store:q4yr0krhgdw4v3wncjft, supplier: NULL }, { created_at: d'2026-02-12T06:09:00Z', id: purchase:x67ysdgodpp2zs2joz3t, items: [purchase_item:23mibf9um2h7s8auxibq], payment_type: payment:xlrbwpau2hilzhr3vahs, purchase_mode: 'Items list', purchase_number: '2', purchase_order: NULL, purchased_by: user_account:wh4jdwgbk9e0ajn6tpfn, store: store:q4yr0krhgdw4v3wncjft, supplier: supplier:c8hssetq4s0gbvtotdj9 }, { created_at: d'2026-02-16T16:43:00Z', id: purchase:z9bqnf0u0xqrtev3ef5l, items: [purchase_item:8brn7016rh4tgdegsv2w], payment_type: payment:xlrbwpau2hilzhr3vahs, purchase_mode: 'Items list', purchase_number: '3', purchase_order: NULL, purchased_by: user_account:wh4jdwgbk9e0ajn6tpfn, store: store:q4yr0krhgdw4v3wncjft, supplier: NULL } ];

-- ------------------------------
-- TABLE: purchase_item
-- ------------------------------

DEFINE TABLE purchase_item TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD barcode ON purchase_item TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD comments ON purchase_item TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON purchase_item TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD expiry_date ON purchase_item TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD is_expire ON purchase_item TYPE option<bool | null> PERMISSIONS FULL;
DEFINE FIELD item ON purchase_item TYPE record<product> PERMISSIONS FULL;
DEFINE FIELD purchase ON purchase_item TYPE option<record<purchase> | null> PERMISSIONS FULL;
DEFINE FIELD purchase_price ON purchase_item TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD purchase_unit ON purchase_item TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD quantity ON purchase_item TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD quantity_requested ON purchase_item TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD quantity_used ON purchase_item TYPE option<float | null> DEFAULT 0 PERMISSIONS FULL;
DEFINE FIELD variants ON purchase_item TYPE array<record<purchase_item_variant>> PERMISSIONS FULL;
DEFINE FIELD variants[*] ON purchase_item TYPE record<purchase_item_variant> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: purchase_item
-- ------------------------------

INSERT [ { comments: '', created_at: d'2026-02-12T09:12:36.218758279Z', id: purchase_item:23mibf9um2h7s8auxibq, item: product:kad8ilvog96sm8d8s2u7, purchase: purchase:x67ysdgodpp2zs2joz3t, purchase_price: 80f, purchase_unit: 'pc', quantity: 10f, quantity_requested: 1f, quantity_used: 0f, variants: [] }, { comments: '', created_at: d'2026-02-12T06:10:30.733347959Z', id: purchase_item:74wwfzm7e8kl0p5mhozt, item: product:kad8ilvog96sm8d8s2u7, purchase_price: 80f, purchase_unit: 'pc', quantity: 5f, quantity_requested: 1f, quantity_used: 0f, variants: [] }, { comments: '', created_at: d'2026-02-16T16:51:48.753329511Z', id: purchase_item:8brn7016rh4tgdegsv2w, item: product:ipf29wf0h3nzvao7vs3y, purchase: purchase:z9bqnf0u0xqrtev3ef5l, purchase_price: 0f, purchase_unit: 'p', quantity: 0f, quantity_requested: 1f, quantity_used: 0f, variants: [purchase_item_variant:w081oq5fhdlkqx812uyi, purchase_item_variant:upe8ikvyuvlfxybnumz9, purchase_item_variant:p3012sf5bakffxiohlhk] }, { comments: '', created_at: d'2026-02-12T09:12:08.092517257Z', id: purchase_item:ef5qe260lqpo9eyfshuy, item: product:kad8ilvog96sm8d8s2u7, purchase: purchase:x67ysdgodpp2zs2joz3t, purchase_price: 80f, purchase_unit: 'pc', quantity: 1f, quantity_requested: 1f, quantity_used: 0f, variants: [] }, { comments: '', created_at: d'2026-02-12T09:08:06.717089735Z', id: purchase_item:g9z2okfihpcnh5a0t81v, item: product:kad8ilvog96sm8d8s2u7, purchase: purchase:x67ysdgodpp2zs2joz3t, purchase_price: 80f, purchase_unit: 'pc', quantity: 1f, quantity_requested: 1f, quantity_used: 0f, variants: [] }, { comments: '', created_at: d'2026-02-12T06:11:37.297838142Z', id: purchase_item:iutzf95yfevb89ervd3s, item: product:kad8ilvog96sm8d8s2u7, purchase_price: 80f, purchase_unit: 'pc', quantity: 5f, quantity_requested: 1f, quantity_used: 0f, variants: [] }, { comments: '', created_at: d'2026-02-12T05:36:11.709174108Z', id: purchase_item:ppsqtn32sskvb3gxb2fa, item: product:kad8ilvog96sm8d8s2u7, purchase: purchase:a2zfyioy2pgv2fxh6vxg, purchase_price: 80f, purchase_unit: 'pc', quantity: 2f, quantity_requested: 2f, quantity_used: 0f, variants: [] }, { comments: '', created_at: d'2026-02-12T06:12:11.466572768Z', id: purchase_item:sc4rowseqqd0uronlly6, item: product:kad8ilvog96sm8d8s2u7, purchase_price: 80f, purchase_unit: 'pc', quantity: 5f, quantity_requested: 1f, quantity_used: 0f, variants: [] }, { comments: '', created_at: d'2026-02-12T09:11:52.266289557Z', id: purchase_item:shsvfvrpun2c7pr90p7r, item: product:kad8ilvog96sm8d8s2u7, purchase: purchase:x67ysdgodpp2zs2joz3t, purchase_price: 80f, purchase_unit: 'pc', quantity: 1f, quantity_requested: 1f, quantity_used: 0f, variants: [] } ];

-- ------------------------------
-- TABLE: purchase_item_variant
-- ------------------------------

DEFINE TABLE purchase_item_variant TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD barcode ON purchase_item_variant TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD comments ON purchase_item_variant TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON purchase_item_variant TYPE option<datetime | null> DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD purchase_item ON purchase_item_variant TYPE option<record<purchase_item> | null> PERMISSIONS FULL;
DEFINE FIELD purchase_price ON purchase_item_variant TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD purchase_unit ON purchase_item_variant TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD quantity ON purchase_item_variant TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD quantity_requested ON purchase_item_variant TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD variant ON purchase_item_variant TYPE record<product_variant> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: purchase_item_variant
-- ------------------------------

INSERT [ { created_at: d'2026-02-16T16:50:48.849807226Z', id: purchase_item_variant:ju2fyvldpevenlclerkr, purchase_price: 1200f, purchase_unit: 'p', quantity: 5f, quantity_requested: 1f, variant: product_variant:d41es4jol5sdbi1mgwmm }, { created_at: d'2026-02-16T16:50:48.920313885Z', id: purchase_item_variant:jzw2xcaglf9rry2kndd6, purchase_price: 1000f, purchase_unit: 'p', quantity: 5f, quantity_requested: 1f, variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T16:51:48.709304298Z', id: purchase_item_variant:p3012sf5bakffxiohlhk, purchase_item: purchase_item:8brn7016rh4tgdegsv2w, purchase_price: 1100f, purchase_unit: 'p', quantity: 5f, quantity_requested: 1f, variant: product_variant:tth8t147mi6kxvcqx6cr }, { created_at: d'2026-02-16T16:50:48.935611767Z', id: purchase_item_variant:rjgz99lljlitqdwkmg3e, purchase_price: 1100f, purchase_unit: 'p', quantity: 5f, quantity_requested: 1f, variant: product_variant:tth8t147mi6kxvcqx6cr }, { created_at: d'2026-02-16T16:51:48.698329039Z', id: purchase_item_variant:upe8ikvyuvlfxybnumz9, purchase_item: purchase_item:8brn7016rh4tgdegsv2w, purchase_price: 1000f, purchase_unit: 'p', quantity: 5f, quantity_requested: 1f, variant: product_variant:c9scluv6l9lqcewchccz }, { created_at: d'2026-02-16T16:51:48.683283096Z', id: purchase_item_variant:w081oq5fhdlkqx812uyi, purchase_item: purchase_item:8brn7016rh4tgdegsv2w, purchase_price: 1200f, purchase_unit: 'p', quantity: 5f, quantity_requested: 1f, variant: product_variant:d41es4jol5sdbi1mgwmm }, { created_at: d'2026-02-16T16:47:52.043886567Z', id: purchase_item_variant:zrmwio5e4stjuszdqczx, purchase_price: 1200f, purchase_unit: 'p', quantity: 5f, quantity_requested: 1f, variant: product_variant:d41es4jol5sdbi1mgwmm } ];

-- ------------------------------
-- TABLE: purchase_order
-- ------------------------------

DEFINE TABLE purchase_order TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created_at ON purchase_order TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD is_used ON purchase_order TYPE option<bool | null> DEFAULT false PERMISSIONS FULL;
DEFINE FIELD items ON purchase_order TYPE array<record<purchase_order_item>> PERMISSIONS FULL;
DEFINE FIELD items[*] ON purchase_order TYPE record<purchase_order_item> PERMISSIONS FULL;
DEFINE FIELD po_number ON purchase_order TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD store ON purchase_order TYPE record<store> PERMISSIONS FULL;
DEFINE FIELD supplier ON purchase_order TYPE record<supplier> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: purchase_order
-- ------------------------------

INSERT [ { created_at: d'2026-02-12T04:56:00Z', id: purchase_order:rccfd5k1mknf07dsbfu9, is_used: true, items: [purchase_order_item:j1wpcm9kdhu70fp2jeqd], po_number: '1', store: store:q4yr0krhgdw4v3wncjft, supplier: supplier:c8hssetq4s0gbvtotdj9 } ];

-- ------------------------------
-- TABLE: purchase_order_item
-- ------------------------------

DEFINE TABLE purchase_order_item TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD comments ON purchase_order_item TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON purchase_order_item TYPE option<datetime | null> DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD item ON purchase_order_item TYPE record<product> PERMISSIONS FULL;
DEFINE FIELD price ON purchase_order_item TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD purchase_order ON purchase_order_item TYPE option<record<purchase_order> | null> PERMISSIONS FULL;
DEFINE FIELD quantity ON purchase_order_item TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD unit ON purchase_order_item TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD variants ON purchase_order_item TYPE array<record<purchase_order_item_variant>> PERMISSIONS FULL;
DEFINE FIELD variants[*] ON purchase_order_item TYPE record<purchase_order_item_variant> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: purchase_order_item
-- ------------------------------

INSERT [ { comments: '', created_at: d'2026-02-12T04:56:19.176136287Z', id: purchase_order_item:j1wpcm9kdhu70fp2jeqd, item: product:kad8ilvog96sm8d8s2u7, price: 80f, purchase_order: purchase_order:rccfd5k1mknf07dsbfu9, quantity: 2f, unit: 'pc', variants: [] } ];

-- ------------------------------
-- TABLE: purchase_order_item_variant
-- ------------------------------

DEFINE TABLE purchase_order_item_variant TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD comments ON purchase_order_item_variant TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON purchase_order_item_variant TYPE option<datetime | null> DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD purchase_order_item ON purchase_order_item_variant TYPE option<record<purchase_order_item> | null> PERMISSIONS FULL;
DEFINE FIELD purchase_price ON purchase_order_item_variant TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD purchase_unit ON purchase_order_item_variant TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD quantity ON purchase_order_item_variant TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD variant ON purchase_order_item_variant TYPE record<product_variant> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: purchase_order_item_variant
-- ------------------------------


-- ------------------------------
-- TABLE: setting
-- ------------------------------

DEFINE TABLE setting TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD description ON setting TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD name ON setting TYPE string PERMISSIONS FULL;
DEFINE FIELD store ON setting TYPE option<record<store> | null> PERMISSIONS FULL;
DEFINE FIELD terminal ON setting TYPE option<record<terminal> | null> PERMISSIONS FULL;
DEFINE FIELD user ON setting TYPE option<record<user_account> | null> PERMISSIONS FULL;
DEFINE FIELD values ON setting FLEXIBLE TYPE any PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: setting
-- ------------------------------

INSERT [ { id: setting:mz5k3usvnph6f14ekyw8, name: 'final_printers', terminal: terminal:99xzlze67p8yqelhulha, values: { printers: [{ printers: [printer:58pmbbhsaj6aa7ni7hwc], prints: '1' }] } } ];

-- ------------------------------
-- TABLE: store
-- ------------------------------

DEFINE TABLE store TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created_at ON store TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD is_active ON store TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD location ON store TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD name ON store TYPE string PERMISSIONS FULL;
DEFINE FIELD terminals ON store TYPE option<array<record<terminal>> | null> PERMISSIONS FULL;
DEFINE FIELD terminals[*] ON store TYPE record<terminal> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: store
-- ------------------------------

INSERT [ { deleted_at: d'2023-01-29T13:23:29Z', id: store:ejrxrfl3bs3q3z0gtbri, is_active: true, location: ' g54b 54', name: 'Secondary', updated_at: d'2023-01-29T13:23:29Z' }, { deleted_at: NULL, id: store:nlh64knntpdopce0aq7l, is_active: true, location: '', name: 'Other store', updated_at: d'2023-08-05T10:59:55Z' }, { deleted_at: NULL, id: store:q4yr0krhgdw4v3wncjft, is_active: true, location: 'Bara dari road lahore', name: 'Main store', terminals: [terminal:j7v7baelzij0efxsjwuz, terminal:99xzlze67p8yqelhulha], updated_at: d'2023-05-12T09:30:55Z' } ];

-- ------------------------------
-- TABLE: supplier
-- ------------------------------

DEFINE TABLE supplier TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD address ON supplier TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON supplier TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD deleted_at ON supplier TYPE option<datetime | null> PERMISSIONS FULL;
DEFINE FIELD email ON supplier TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD fax ON supplier TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD is_active ON supplier TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD media ON supplier TYPE option<record<media> | null> PERMISSIONS FULL;
DEFINE FIELD name ON supplier TYPE string PERMISSIONS FULL;
DEFINE FIELD opening_balance ON supplier TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD payments ON supplier TYPE option<array<record<supplier_payment>> | null> PERMISSIONS FULL;
DEFINE FIELD payments[*] ON supplier TYPE record<supplier_payment> PERMISSIONS FULL;
DEFINE FIELD phone ON supplier TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD purchases ON supplier TYPE option<array<record<purchase>> | null> PERMISSIONS FULL;
DEFINE FIELD purchases[*] ON supplier TYPE record<purchase> PERMISSIONS FULL;
DEFINE FIELD stores ON supplier TYPE array<record<store>> PERMISSIONS FULL;
DEFINE FIELD stores[*] ON supplier TYPE record<store> PERMISSIONS FULL;
DEFINE FIELD whatsapp ON supplier TYPE option<string | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: supplier
-- ------------------------------

INSERT [ { email: 'dg@gmail.com', id: supplier:c8hssetq4s0gbvtotdj9, is_active: true, name: 'waseem', opening_balance: 0dec, phone: '5456', stores: [store:ejrxrfl3bs3q3z0gtbri, store:nlh64knntpdopce0aq7l, store:q4yr0krhgdw4v3wncjft] } ];

-- ------------------------------
-- TABLE: supplier_payment
-- ------------------------------

DEFINE TABLE supplier_payment TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD amount ON supplier_payment TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD created_at ON supplier_payment TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD description ON supplier_payment TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD purchase ON supplier_payment TYPE option<record<purchase> | null> PERMISSIONS FULL;
DEFINE FIELD supplier ON supplier_payment TYPE record<supplier> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: supplier_payment
-- ------------------------------

INSERT [ { amount: 10f, created_at: d'2026-02-12T14:34:15.131494847Z', description: 'testing', id: supplier_payment:1mmmmk9hl5h3sx33hlwv, purchase: purchase:x67ysdgodpp2zs2joz3t, supplier: supplier:c8hssetq4s0gbvtotdj9 } ];

-- ------------------------------
-- TABLE: tax
-- ------------------------------

DEFINE TABLE tax TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created_at ON tax TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD is_active ON tax TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD name ON tax TYPE string PERMISSIONS FULL;
DEFINE FIELD rate ON tax TYPE option<float | null> PERMISSIONS FULL;
DEFINE FIELD stores ON tax TYPE array<record<store>> PERMISSIONS FULL;
DEFINE FIELD stores[*] ON tax TYPE record<store> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: tax
-- ------------------------------

INSERT [ { id: tax:cp3kz5kq2tousp3lwvbx, is_active: true, name: 'GST', rate: 17f, stores: [store:ejrxrfl3bs3q3z0gtbri, store:nlh64knntpdopce0aq7l, store:q4yr0krhgdw4v3wncjft] }, { created_at: d'2026-02-10T14:05:47.612781549Z', id: tax:ozqh2l84geyo2zfok7d4, is_active: true, name: '5%', rate: 5f, stores: [store:ejrxrfl3bs3q3z0gtbri, store:nlh64knntpdopce0aq7l, store:q4yr0krhgdw4v3wncjft] } ];

-- ------------------------------
-- TABLE: terminal
-- ------------------------------

DEFINE TABLE terminal TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD code ON terminal TYPE string PERMISSIONS FULL;
DEFINE FIELD created_at ON terminal TYPE option<datetime | null> DEFAULT time::now() VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD description ON terminal TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD is_active ON terminal TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD products ON terminal TYPE option<array<record<product>> | null> PERMISSIONS FULL;
DEFINE FIELD products[*] ON terminal TYPE record<product> PERMISSIONS FULL;
DEFINE FIELD store ON terminal TYPE option<record<store> | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: terminal
-- ------------------------------

INSERT [ { code: '02', created_at: d'2026-02-20T08:20:46.162396098Z', id: terminal:99xzlze67p8yqelhulha, is_active: true, products: [product:kad8ilvog96sm8d8s2u7, product:u1l0zeuqchsifal0p9r8, product:ipf29wf0h3nzvao7vs3y], store: store:q4yr0krhgdw4v3wncjft }, { code: '01', created_at: d'2026-02-20T08:20:46.166162150Z', id: terminal:j7v7baelzij0efxsjwuz, is_active: true, products: [product:kad8ilvog96sm8d8s2u7, product:u1l0zeuqchsifal0p9r8, product:ipf29wf0h3nzvao7vs3y], store: store:q4yr0krhgdw4v3wncjft } ];

-- ------------------------------
-- TABLE: user_account
-- ------------------------------

DEFINE TABLE user_account TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created_at ON user_account TYPE option<datetime | null> VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD display_name ON user_account TYPE string PERMISSIONS FULL;
DEFINE FIELD email ON user_account TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD is_active ON user_account TYPE option<bool | null> DEFAULT true PERMISSIONS FULL;
DEFINE FIELD password ON user_account TYPE string PERMISSIONS FULL;
DEFINE FIELD password_reset_token ON user_account TYPE option<string | null> PERMISSIONS FULL;
DEFINE FIELD roles ON user_account TYPE option<array<string> | null> PERMISSIONS FULL;
DEFINE FIELD roles[*] ON user_account TYPE string PERMISSIONS FULL;
DEFINE FIELD stores ON user_account TYPE option<array<record<store>> | null> PERMISSIONS FULL;
DEFINE FIELD stores[*] ON user_account TYPE record<store> PERMISSIONS FULL;
DEFINE FIELD username ON user_account TYPE string PERMISSIONS FULL;
DEFINE FIELD verification_token ON user_account TYPE option<string | null> PERMISSIONS FULL;



-- ------------------------------
-- TABLE DATA: user_account
-- ------------------------------

INSERT [ { display_name: 'user', email: 'user@gmail.com', id: user_account:jz2b0fpssnix33y8305j, is_active: true, password: 'crypto::bcrypt::generate(user)', roles: ['ROLE_USER'], stores: [store:ejrxrfl3bs3q3z0gtbri, store:nlh64knntpdopce0aq7l, store:q4yr0krhgdw4v3wncjft], username: 'user' }, { display_name: 'Admin', id: user_account:wh4jdwgbk9e0ajn6tpfn, is_active: true, password: '$2b$12$WvKx9bsWkx02Z3sG2l2cbe/Cx6azwe/14x1QghAhMQtuMy3DWZ0Ji', roles: ['ROLE_ADMIN'], stores: [store:q4yr0krhgdw4v3wncjft], username: 'admin' } ];

