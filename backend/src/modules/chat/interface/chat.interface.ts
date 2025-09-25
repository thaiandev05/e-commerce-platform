export interface Message_Queue {
	id: string
	content: string
	roomId: string
	senderId: string,
	receiverId: string
	repToId: string | null
}

export interface User_Custom {
	id: string;
	username: string;
	roles: {
		role: {
			roleName: string;
		};
	}[];
}
