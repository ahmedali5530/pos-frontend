# Getting Started with Point of sale system

### Demo
[https://pos.ahmedali5530.xyz](https://pos.ahmedali5530.xyz)

Username: admin

Password: admin

A point of sale system built using React.js and SurrealDB.
### Features

- Order management
- Detailed Multi Store Inventory for items and variants
- Expenses
- Multiple stores with multiple terminals
- Can support variants. i.e. sizes, colors, anything etc...
- Supports shortcuts for faster operations
- Day closing
- Supports multiple taxes
- Supports multiple discounts
- Customers management
- Suppliers management
- Supports Refunds
- Print server for faster and headless printing

## Other projects
If you are interested in for restaurant based software, [Checkout my other](https://github.com/ahmedali5530/react-posr) software for demo.

## Requirements
- [Bun](https://bun.com/docs/installation)
- [SurrealDB](https://surrealdb.com/docs/surrealdb/installation) 
- Any text editor for updating configuration files
## Installation
- Download or clone this project
- run `bun install` to install all third party libraries
- open another terminal and run `surreal start -u root -p root surrealkv://database --bind 0.0.0.0:8001`.
- For database import run this `surreal import --conn http://localhost:8001 --user root --pass root --ns pos --db pos database/latest.surql`
- create a new file `.env.local` add `VITE_DB_WEBDOCKET=ws://localhost:8001`
- Then run following Available scripts to run application.
- Use `VITE_CURRENCY` and `VITE_LOCALE` variable to setup your currency settings.
- Use `VITE_DATE_FORMAT` and `VITE_TIME_FORMAT` for time formats, I am using [luxon](https://moment.github.io/luxon/#/formatting) for date and time formatting.
- Finally run `bun run dev` to start the application
- For print server go to printing directory and install dependencies using `bun install`, then `bun run server.js` to start it.  It will start on port 3132 on localhost.

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.
