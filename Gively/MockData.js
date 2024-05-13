export const charities = [
    {
      charityName: "Save the Children",
      charityDescription: "Save the Children is an international non-governmental organization that promotes children's rights, provides relief and helps support children in developing countries.",
      charityCategories: ["Children", "Education", "Healthcare"],
    },
    {
      charityName: "World Wildlife Fund",
      charityDescription: "The World Wildlife Fund is an international organization that works to conserve nature and reduce the most pressing threats to the diversity of life on Earth.",
      charityCategories: ["Environment", "Conservation", "Wildlife"],
    },
    {
      charityName: "Doctors Without Borders",
      charityDescription: "Doctors Without Borders is an international medical humanitarian organization that provides aid to people affected by armed conflict, epidemics, natural disasters, and exclusion from healthcare.",
      charityCategories: ["Healthcare", "Humanitarian", "Emergency Response"],
    },
    {
      charityName: "UNICEF",
      charityDescription: "UNICEF works in over 190 countries and territories to save children's lives, to defend their rights, and to help them fulfill their potential, from early childhood through adolescence.",
      charityCategories: ["Children", "Education", "Healthcare"],
    },
    {
      charityName: "Oxfam",
      charityDescription: "Oxfam is a confederation of 20 independent charitable organizations focusing on the alleviation of global poverty, inequality, and related causes.",
      charityCategories: ["Poverty Alleviation", "Humanitarian", "Advocacy"],
    },
    {
      charityName: "American Red Cross",
      charityDescription: "The American Red Cross is a humanitarian organization that provides emergency assistance, disaster relief, and education inside the United States.",
      charityCategories: ["Disaster Relief", "Healthcare", "Emergency Response"],
    }
  ];

  export const user = {
    username: "Andy Abebaw",
    following: 150,
    followers: 2000,
    bioHeader: "Dog Lover, Engineer, Human",
    mainBioText: "If you can't feed a hundred people, then just feed one.",
    interests: ['Health', 'Education', 'Environment', 'Animal Welfare', 'Arts & Culture']
  }


  export const fakeFriends = [
    { id: 1, name: 'John Doe' , areFollowing: true},
    { id: 2, name: 'Jane Smith' , areFollowing: true},
    { id: 3, name: 'Michael Johnson', areFollowing: true },
    { id: 4, name: 'Emily Williams' ,areFollowing: true},
    { id: 5, name: 'David Brown' , areFollowing:true},
    { id: 6, name: 'Sarah Jones' , areFollowing: true},
    { id: 7, name: 'Daniel Martinez', areFollowing: true },
    { id: 8, name: 'Jennifer Davis' , areFollowing: true},
    { id: 9, name: 'James Wilson' , areFollowing: true},
    { id: 10, name: 'Linda Taylor', areFollowing: true },
  ];

  export const fakeFriendReccomendations = [
    { id: 11, name: 'Robert Anderson', areFollowing: false},
    { id: 12, name: 'Patricia Thomas', areFollowing:false},
    { id: 13, name: 'William Jackson', areFollowing: false},
    { id: 14, name: 'Jessica White' ,areFollowing: false},
    { id: 15, name: 'Richard Harris', areFollowing: false },
    { id: 16, name: 'Mary Lee' ,areFollowing:false},
    { id: 17, name: 'Charles Clark' , areFollowing: false},
    { id: 18, name: 'Karen Scott' , areFollowing: false},
    { id: 19, name: 'Joseph Green', areFollowing: false },
    { id: 20, name: 'Nancy Evans' , areFollowing:false}
  ];

  export const charityCategories = [
    { id: 1, name: 'Education' },
    { id: 2, name: 'Health' },
    { id: 3, name: 'Environment' },
    { id: 4, name: 'Animal Welfare' },
    { id: 5, name: 'Poverty Alleviation' },
    { id: 6, name: 'Arts & Culture' },
    { id: 7, name: 'Disaster Relief' },
    { id: 8, name: 'Community Development' },
    { id: 9, name: 'Human Rights' },
    { id: 10, name: 'International Aid' },
    { id: 11, name: 'Social Services' },
    { id: 12, name: 'Youth Development' },
    { id: 13, name: 'Gender Equality' }
  ];

  export const postsData = [
    {
      id: 1,
      originalDonationPoster: "John Doe",
      originalPosterProfileImage: require('./assets/Images/poster.png'),
      postText: "I've been supporting this charity for years. Their work in education is truly inspiring!",
      likes: 102,
      otherDonationUsers: [],
      date: "Wed, Apr 28 • 5:30 PM",
      charityName: "Education for All Foundation",
      isLiked: true
    },
    {
      id: 2,
      originalDonationPoster: "Alice Smith",
      originalPosterProfileImage: require('./assets/Images/poster.png'),
      postText: "This charity does amazing work for animal welfare. I'm proud to be a supporter!",
      likes: 75,
      otherDonationUsers: ["John"],
      date: "Thu, Apr 29 • 8:45 AM",
      charityName: "Animal Rescue League",
      isLiked: false
    },
    {
      id: 3,
      originalDonationPoster: "Emily Johnson",
      originalPosterProfileImage: require('./assets/Images/poster.png'),
      postText: "I donated to this charity to support their environmental conservation efforts. Every little bit helps!",
      likes: 62,
      otherDonationUsers: ["Alice", "John", "David"],
      date: "Fri, Apr 30 • 3:15 PM",
      charityName: "Green Earth Initiative",
      isLiked: true
    },
    {
      id: 4,
      originalDonationPoster: "Michael Brown",
      originalPosterProfileImage: require('./assets/Images/poster.png'),
      postText: "I'm happy to support this charity's mission of providing clean water to communities in need.",
      likes: 48,
      otherDonationUsers: ["Alice", "Bob", "Charlie"],
      date: "Sat, May 1 • 10:00 AM",
      charityName: "Clean Water Initiative",
      isLiked: false
    },
    {
      id: 5,
      originalDonationPoster: "Emma Wilson",
      originalPosterProfileImage: require('./assets/Images/poster.png'),
      postText: "This charity's work in healthcare is vital, especially during these challenging times.",
      likes: 91,
      otherDonationUsers: ["John", "David", "Emma"],
      date: "Sun, May 2 • 1:30 PM",
      charityName: "Healthcare for All",
      isLiked: false
    },
    {
      id: 6,
      originalDonationPoster: "Daniel Martinez",
      originalPosterProfileImage: require('./assets/Images/poster.png'),
      postText: "I support this charity because of their dedication to fighting poverty and hunger.",
      likes: 55,
      otherDonationUsers: ["Alice", "Charlie", "Emma"],
      date: "Mon, May 3 • 6:20 PM",
      charityName: "Fight Against Poverty",
      isLiked: true
    },
    {
      id: 7,
      originalDonationPoster: "Olivia Taylor",
      originalPosterProfileImage: require('./assets/Images/poster.png'),
      postText: "I donated to this charity to help them continue their important work in disaster relief efforts.",
      likes: 42,
      otherDonationUsers: ["John", "Bob", "David"],
      date: "Tue, May 4 • 9:10 AM",
      charityName: "Disaster Relief Fund",
      isLiked: true
    },
    {
      id: 8,
      originalDonationPoster: "William Anderson",
      originalPosterProfileImage: require('./assets/Images/poster.png'),
      postText: "This charity's focus on community development is making a real difference in people's lives.",
      likes: 67,
      otherDonationUsers: ["Alice"],
      date: "Wed, May 5 • 4:45 PM",
      charityName: "Community Development Association",
      isLiked: false
    },
    {
      id: 9,
      originalDonationPoster: "Sophia Garcia",
      originalPosterProfileImage: require('./assets/Images/poster.png'),
      postText: "I support this charity because of their commitment to promoting human rights and equality.",
      likes: 83,
      otherDonationUsers: ["John", "David", "Sophia"],
      date: "Thu, May 6 • 11:55 AM",
      charityName: "Human Rights Advocates",
      isLiked: true
    },
    {
      id: 10,
      originalDonationPoster: "James Martinez",
      originalPosterProfileImage: require('./assets/Images/poster.png'),
      postText: "I donated to this charity to help provide international aid to those in need around the world.",
      likes: 59,
      otherDonationUsers: ["Alice"],
      date: "Fri, May 7 • 7:30 PM",
      charityName: "International Aid Foundation",
      isLiked: false
    }
  ];
  
  export const charityData = [
    {
      id: 1,
      charityName: 'Global Relief',
      color: '#553766', 
      percentage: 50
    },
    {
      id: 2,
      charityName: 'Health for All',
      color: '#E7357D', 
      percentage: 20
    },
    {
      id: 3,
      charityName: 'Education Bridge',
      color: '#F7A931', 
      percentage: 20
    },
    {
      id: 4,
      charityName: 'Wildlife Rescue',
      color: '#EC6929', 
      percentage: 10
    }
  ]


  export const petitionData = {
    userName: 'Andy',
    postDate: 'Wed, Apr 28 • 5:30 PM',
    postText: 'Help Me Raise Awareness',
    petitionUrl: 'https://www.change.org/p/nfl-have-sweet-victory-performed-at-the-super-bowl',
    isLiked: true,
    likesCount: 24,
  };


  export const GoFundMeData = {
    userName: 'Andy',
    postDate: 'Wed, Apr 28 • 5:30 PM',
    postText: 'Help Me Raise Awareness',
    goFundMeUrl: 'https://www.gofundme.com/f/honoring-our-hero-and-dad-matthew-mar?qid=582f036013a533538a67930a44a30995',
    isLiked: true,
    likesCount: 24,
  };