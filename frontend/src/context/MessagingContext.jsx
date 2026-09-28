import { createContext, useContext, useMemo, useState } from "react";

const MessagingContext = createContext({
	isOpen: false,
	activeUserId: null,
	toggle: () => {},
	open: () => {},
	close: () => {},
	openChat: () => {},
	backToList: () => {},
});

export const useMessagingWidget = () => useContext(MessagingContext);

export const MessagingWidgetProvider = ({ children }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [activeUserId, setActiveUserId] = useState(null);

	const value = useMemo(
		() => ({
			isOpen,
			activeUserId,
			toggle: () => setIsOpen((prev) => !prev),
			open: () => setIsOpen(true),
			close: () => setIsOpen(false),
			openChat: (userId) => {
				setActiveUserId(userId);
				setIsOpen(true);
			},
			backToList: () => setActiveUserId(null),
		}),
		[isOpen, activeUserId]
	);

	return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
};
