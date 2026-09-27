import { Link } from "react-router-dom";

const TOKEN_REGEX = /([#@][a-zA-Z0-9_.-]+)/g;

// Renders plain text, turning #hashtags and @mentions into links.
export const renderRichText = (text) => {
	if (!text) return text;

	return text.split(TOKEN_REGEX).map((part, index) => {
		if (part.startsWith("#") && part.length > 1) {
			const tag = part.slice(1);
			return (
				<Link key={index} to={`/hashtag/${tag}`} className='text-primary hover:underline'>
					{part}
				</Link>
			);
		}

		if (part.startsWith("@") && part.length > 1) {
			const username = part.slice(1);
			return (
				<Link key={index} to={`/profile/${username}`} className='text-primary font-medium hover:underline'>
					{part}
				</Link>
			);
		}

		return part;
	});
};
