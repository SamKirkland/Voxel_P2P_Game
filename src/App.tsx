import React, { Suspense } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
const Admin = React.lazy(() => import('./Admin'));

const isAdminPage = window.location.pathname === "/admin";

function App() {
	if (isAdminPage) {
		return (
			<Suspense fallback={<div>Loading...</div>}>
				<Admin />
			</Suspense>
		);
	}

	return (
		<WelcomeScreen />
	);
}

export default App;
