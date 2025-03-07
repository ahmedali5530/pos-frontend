# Getting Started with Point of sale system

### Demo
[https://pos.ezportal.online](https://pos.ezportal.online)

Username: admin

Password: admin

A point of sale system built using React.js and [Symfony as a backend](https://github.com/ahmedali5530/pos).
### Features

- Order management
- Inventory
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

## Other projects
If you are interested in for restaurant based software, [Checkout my other](https://github.com/ahmedali5530/react-posr) software for demo.

## Requirements
- NodeJs >= 14
- Any text editor for updating configuration files
## Installation
- Download or clone this project
- run `yarn install` to install all third party libraries
- After setting up and running [symfony](https://github.com/ahmedali5530/pos) instance open `.env` file and add your `VITE_API_HOST` variable according to your symfony installation. 
- Then run following Available scripts to run application.
- Use `VITE_CURRENCY` and `VITE_LOCALE` variable to setup your currency settings.
- Use `VITE_DATE_FORMAT` and `VITE_TIME_FORMAT` for time formats, I am using [luxon](https://moment.github.io/luxon/#/formatting) for date and time formatting.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
