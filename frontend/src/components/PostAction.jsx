export default function PostAction({ icon, text, onClick, active }) {
	return (
		<button
			className={`flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-base-100 transition-colors text-sm font-medium flex-1 justify-center ${
				active ? "text-primary" : ""
			}`}
			onClick={onClick}
		>
			<span>{icon}</span>
			<span className='hidden sm:inline'>{text}</span>
		</button>
	);
}
