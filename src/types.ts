export interface Game {
  id: string;
  title: string;
  description: string;
  content?: string;
  youtubeLink?: string;
  links?: { title: string; url: string }[];
  eventDate?: string;
  eventTime?: string;
  imageUrl: string;
  category: string;
  tags?: string[];
  createdAt: any;
  updatedAt: any;
  link?: string;
  status?: 'published' | 'archived' | 'trash';
  deletedAt?: any;
  ratings?: Record<string, number>;
}

export interface Comment {
  id?: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: any;
  parentId?: string; // For replies
  likes?: string[];
}

export interface Notification {
  id?: string;
  userId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  postId: string;
  type: 'reply' | 'new_comment' | 'like';
  text: string;
  read: boolean;
  createdAt: any;
}

export interface GiveawayParticipant {
  userId: string;
  userName: string;
  answer: string;
  createdAt: any;
}

export interface Giveaway {
  id?: string;
  title: string;
  conditions: string;
  endDate?: string;
  active: boolean;
  createdAt: any;
  participants?: Record<string, GiveawayParticipant>; // UID -> participant info
}

export interface Product {
  id?: string;
  title: string;
  description: string;
  price: string;
  badge?: string;
  imageUrl: string;
  link: string;
  active: boolean;
  createdAt: any;
}

export interface WeeklyQuestion {
  id?: string;
  type?: 'quiz' | 'poll';
  correctOptionIndex?: number;
  question: string;
  options: string[]; // 4 options
  votes?: Record<string, number>; // UID -> optionIndex
  createdAt: any;
  active: boolean;
}
