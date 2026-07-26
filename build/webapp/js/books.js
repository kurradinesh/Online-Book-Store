/**
 * BOOK DATABASE ENGINE
 * Handles data persistence, CRUD operations, and Servlet API bridging.
 */

// 1. DATA INITIALIZATION
const SEED_BOOKS = [
	{ id: 1, name: "Atomic Habits", author: "James Clear", price: 499, format: "Paperback", subject: "Self Help", class: "General", genre: "Self-help" },
	  { id: 2, name: "Rich Dad Poor Dad", author: "Robert T. Kiyosaki", price: 399, format: "Paperback", subject: "Finance", class: "General", genre: "Self-help" },
	  { id: 3, name: "The Psychology of Money", author: "Morgan Housel", price: 399, format: "Paperback", subject: "Finance", class: "General", genre: "Self-help" },
	  { id: 4, name: "NCERT History Class 10 Part 1", author: "NCERT", price: 495, format: "Part 1", subject: "History", class: 10, genre: "Textbook" },
	  { id: 5, name: "NCERT Geography Class 2", author: "NCERT", price: 521, format: "Textbook", subject: "Geography", class: 2, genre: "Textbook" },
	  { id: 6, name: "NCERT Geography Class 11 Guide", author: "NCERT", price: 612, format: "Guide", subject: "Geography", class: 11, genre: "Textbook" },
	  { id: 7, name: "Harry Potter and the Chamber of Secrets", author: "J.K. Rowling", price: 1344, format: "Textbook", subject: "Fantasy", class: "General", genre: "Fiction" },
	  { id: 8, name: "NCERT Geography Class 3 Part 1", author: "NCERT", price: 478, format: "Part 1", subject: "Geography", class: 3, genre: "Textbook" },
	  { id: 9, name: "NCERT Political Science Class 4 Volume 1", author: "NCERT", price: 462, format: "Volume 1", subject: "Political Science", class: 4, genre: "Textbook" },
	  { id: 10, name: "NCERT History Class 1 Workbook", author: "NCERT", price: 921, format: "Workbook", subject: "History", class: 1, genre: "Textbook" },
	  { id: 11, name: "Ikigai", author: "Hector Garcia & Francesc Miralles", price: 350, format: "Paperback", subject: "Self Help", class: "General", genre: "Self-help" },
	  { id: 12, name: "The Alchemist", author: "Paulo Coelho", price: 299, format: "Paperback", subject: "Novel", class: "General", genre: "Fiction" },
	  { id: 13, name: "NCERT Biology Class 1 Guide", author: "NCERT", price: 362, format: "Guide", subject: "Biology", class: 1, genre: "Textbook" },
	  { id: 14, name: "Think and Grow Rich", author: "Napoleon Hill", price: 250, format: "Paperback", subject: "Self Help", class: "General", genre: "Self-help" },
	  { id: 15, name: "Wings of Fire", author: "A.P.J. Abdul Kalam", price: 350, format: "Paperback", subject: "Biography", class: "General", genre: "Biography" },
	  { id: 16, name: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", price: 450, format: "Paperback", subject: "Self Help", class: "General", genre: "Self-help" },
	  { id: 17, name: "The Monk Who Sold His Ferrari", author: "Robin Sharma", price: 300, format: "Paperback", subject: "Self Help", class: "General", genre: "Self-help" },
	  { id: 18, name: "The Power of Your Subconscious Mind", author: "Joseph Murphy", price: 280, format: "Paperback", subject: "Psychology", class: "General", genre: "Self-help" },
	  { id: 19, name: "Can't Hurt Me", author: "David Goggins", price: 599, format: "Paperback", subject: "Biography", class: "General", genre: "Biography" },
	  { id: 20, name: "Do Epic Shit", author: "Ankur Warikoo", price: 299, format: "Paperback", subject: "Self Help", class: "General", genre: "Self-help" },
	  { id: 21, name: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling", price: 500, format: "Paperback", subject: "Fantasy", class: "General", genre: "Fiction" },
	  { id: 22, name: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", price: 450, format: "Paperback", subject: "Self Help", class: "General", genre: "Self-help" },
	  { id: 23, name: "Think Like a Monk", author: "Jay Shetty", price: 399, format: "Paperback", subject: "Self Help", class: "General", genre: "Self-help" },
	  { id: 24, name: "Deep Work", author: "Cal Newport", price: 480, format: "Paperback", subject: "Productivity", class: "General", genre: "Self-help" },
	  { id: 25, name: "Start With Why", author: "Simon Sinek", price: 550, format: "Paperback", subject: "Business", class: "General", genre: "Self-help" },
	  { id: 26, name: "The Rudest Book Ever", author: "Shwetabh Gangwar", price: 299, format: "Paperback", subject: "Self Help", class: "General", genre: "Self-help" },
	  { id: 27, name: "48 Laws of Power", author: "Robert Greene", price: 599, format: "Paperback", subject: "Strategy", class: "General", genre: "Self-help" },
	  { id: 28, name: "The Intelligent Investor", author: "Benjamin Graham", price: 699, format: "Paperback", subject: "Finance", class: "General", genre: "Finance" },
	  { id: 29, name: "Eat That Frog", author: "Brian Tracy", price: 350, format: "Paperback", subject: "Productivity", class: "General", genre: "Self-help" },
	  { id: 30, name: "The Richest Man in Babylon", author: "George S. Clason", price: 299, format: "Paperback", subject: "Finance", class: "General", genre: "Finance" },
	  { id: 31, name: "It Ends With Us", author: "Colleen Hoover", price: 450, format: "Paperback", subject: "Romance", class: "General", genre: "Fiction" },
	  { id: 32, name: "The Power of Now", author: "Eckhart Tolle", price: 399, format: "Paperback", subject: "Spirituality", class: "General", genre: "Spirituality" },
	  { id: 33, name: "Shoe Dog", author: "Phil Knight", price: 499, format: "Paperback", subject: "Biography", class: "General", genre: "Biography" },
	  { id: 34, name: "Sapiens", author: "Yuval Noah Harari", price: 599, format: "Paperback", subject: "History", class: "General", genre: "History" },
	  { id: 35, name: "The Hobbit", author: "J.R.R. Tolkien", price: 399, format: "Paperback", subject: "Fantasy", class: "General", genre: "Fiction" },
	  { id: 36, name: "The Fault in Our Stars", author: "John Green", price: 350, format: "Paperback", subject: "Romance", class: "General", genre: "Fiction" },
	  { id: 37, name: "One Indian Girl", author: "Chetan Bhagat", price: 299, format: "Paperback", subject: "Fiction", class: "General", genre: "Fiction" },
	  { id: 38, name: "The Girl in Room 105", author: "Chetan Bhagat", price: 299, format: "Paperback", subject: "Thriller", class: "General", genre: "Fiction" },
	  { id: 39, name: "Half Girlfriend", author: "Chetan Bhagat", price: 299, format: "Paperback", subject: "Romance", class: "General", genre: "Fiction" },
	  { id: 40, name: "The 5 AM Club", author: "Robin Sharma", price: 499, format: "Paperback", subject: "Self Help", class: "General", genre: "Self-help" },
	  { id: 41, name: "The Midnight Library", author: "Matt Haig", price: 399, format: "Paperback", subject: "Fiction", class: "General", genre: "Fiction" },
	  { id: 42, name: "A Brief History of Time", author: "Stephen Hawking", price: 450, format: "Paperback", subject: "Science", class: "General", genre: "Science" },
	  { id: 43, name: "The Kite Runner", author: "Khaled Hosseini", price: 399, format: "Paperback", subject: "Fiction", class: "General", genre: "Fiction" },
	  { id: 44, name: "The Book Thief", author: "Markus Zusak", price: 399, format: "Paperback", subject: "Historical Fiction", class: "General", genre: "Fiction" },
	  { id: 45, name: "The Secret", author: "Rhonda Byrne", price: 350, format: "Paperback", subject: "Self Help", class: "General", genre: "Self-help" },
	  { id: 46, name: "How to Win Friends & Influence People", author: "Dale Carnegie", price: 299, format: "Paperback", subject: "Communication", class: "General", genre: "Self-help" },
	  { id: 47, name: "Man's Search for Meaning", author: "Viktor E. Frankl", price: 350, format: "Paperback", subject: "Psychology", class: "General", genre: "Psychology" },
	  { id: 48, name: "The Four Agreements", author: "Don Miguel Ruiz", price: 299, format: "Paperback", subject: "Self Help", class: "General", genre: "Self-help" },
	  { id: 49, name: "The Compound Effect", author: "Darren Hardy", price: 399, format: "Paperback", subject: "Success", class: "General", genre: "Self-help" },
	  { id: 50, name: "The Silent Patient", author: "Alex Michaelides", price: 450, format: "Paperback", subject: "Thriller", class: "General", genre: "Fiction" },
	  { id: 51, name: "The Alchemist's Secret", author: "Scott Mariani", price: 399, format: "Paperback", subject: "Adventure", class: "General", genre: "Fiction" },
	  { id: 52, name: "The Da Vinci Code", author: "Dan Brown", price: 399, format: "Paperback", subject: "Mystery", class: "General", genre: "Fiction" },
	  { id: 53, name: "The Martian", author: "Andy Weir", price: 450, format: "Paperback", subject: "Science Fiction", class: "General", genre: "Fiction" },
	  { id: 54, name: "The Shining", author: "Stephen King", price: 499, format: "Paperback", subject: "Horror", class: "General", genre: "Fiction" },
	  { id: 55, name: "The Catcher in the Rye", author: "J.D. Salinger", price: 350, format: "Paperback", subject: "Classic", class: "General", genre: "Fiction" },
	  { id: 56, name: "To Kill a Mockingbird", author: "Harper Lee", price: 399, format: "Paperback", subject: "Classic", class: "General", genre: "Fiction" },
	  { id: 57, name: "1984", author: "George Orwell", price: 450, format: "Paperback", subject: "Dystopian", class: "General", genre: "Fiction" },
	  { id: 58, name: "Pride and Prejudice", author: "Jane Austen", price: 350, format: "Paperback", subject: "Classic", class: "General", genre: "Fiction" },
	  { id: 59, name: "Head First Java", author: "Kathy Sierra & Bert Bates", price: 650, format: "Paperback", subject: "Java Programming", class: "General", genre: "Programming" },
	  { id: 60, name: "Java: The Complete Reference", author: "Herbert Schildt", price: 800, format: "Paperback", subject: "Java Programming", class: "General", genre: "Programming" },
	  { id: 61, name: "Effective Java", author: "Joshua Bloch", price: 750, format: "Paperback", subject: "Java Programming", class: "Advanced", genre: "Programming" },
	  { id: 62, name: "Core Java Volume I", author: "Cay S. Horstmann", price: 700, format: "Paperback", subject: "Java Programming", class: "General", genre: "Programming" },
	  { id: 63, name: "Clean Code", author: "Robert C. Martin", price: 850, format: "Paperback", subject: "Software Engineering", class: "Advanced", genre: "Programming" },
	  { id: 64, name: "Introduction to Algorithms", author: "Thomas H. Cormen", price: 950, format: "Paperback", subject: "Algorithms", class: "Advanced", genre: "Programming" },
	  { id: 65, name: "Data Structures and Algorithms Made Easy", author: "Narasimha Karumanchi", price: 650, format: "Paperback", subject: "Data Structures", class: "General", genre: "Programming" },
	  { id: 66, name: "Cracking the Coding Interview", author: "Gayle Laakmann McDowell", price: 900, format: "Paperback", subject: "Interview Preparation", class: "Advanced", genre: "Programming" },
	  { id: 67, name: "Python Crash Course", author: "Eric Matthes", price: 600, format: "Paperback", subject: "Python Programming", class: "Beginner", genre: "Programming" },
	  { id: 68, name: "Learning Python", author: "Mark Lutz", price: 850, format: "Paperback", subject: "Python Programming", class: "Advanced", genre: "Programming" },
	  { id: 69, name: "Head First Python", author: "Paul Barry", price: 650, format: "Paperback", subject: "Python Programming", class: "Beginner", genre: "Programming" },
	  { id: 70, name: "Automate the Boring Stuff with Python", author: "Al Sweigart", price: 550, format: "Paperback", subject: "Python Programming", class: "Beginner", genre: "Programming" },
	  { id: 71, name: "C Programming Language", author: "Brian W. Kernighan & Dennis Ritchie", price: 500, format: "Paperback", subject: "C Programming", class: "General", genre: "Programming" },
	  { id: 72, name: "Let Us C", author: "Yashavant Kanetkar", price: 450, format: "Paperback", subject: "C Programming", class: "Beginner", genre: "Programming" },
	  { id: 73, name: "Programming in ANSI C", author: "E. Balagurusamy", price: 550, format: "Paperback", subject: "C Programming", class: "General", genre: "Programming" },
	  { id: 74, name: "Object Oriented Programming with C++", author: "E. Balagurusamy", price: 600, format: "Paperback", subject: "C++ Programming", class: "General", genre: "Programming" },
	  { id: 75, name: "The C++ Programming Language", author: "Bjarne Stroustrup", price: 900, format: "Paperback", subject: "C++ Programming", class: "Advanced", genre: "Programming" },
	  { id: 76, name: "HTML and CSS", author: "Jon Duckett", price: 550, format: "Paperback", subject: "Web Development", class: "Beginner", genre: "Programming" },
	  { id: 77, name: "JavaScript: The Good Parts", author: "Douglas Crockford", price: 500, format: "Paperback", subject: "JavaScript", class: "Intermediate", genre: "Programming" },
	  { id: 78, name: "Eloquent JavaScript", author: "Marijn Haverbeke", price: 600, format: "Paperback", subject: "JavaScript", class: "Beginner", genre: "Programming" },
	  { id: 79, name: "You Don't Know JS", author: "Kyle Simpson", price: 650, format: "Paperback", subject: "JavaScript", class: "Advanced", genre: "Programming" },
	  { id: 80, name: "Learning SQL", author: "Alan Beaulieu", price: 550, format: "Paperback", subject: "SQL", class: "Beginner", genre: "Programming" },
	  { id: 81, name: "SQL Cookbook", author: "Anthony Molinaro", price: 750, format: "Paperback", subject: "SQL", class: "Advanced", genre: "Programming" },
	  { id: 82, name: "Database System Concepts", author: "Abraham Silberschatz", price: 850, format: "Paperback", subject: "DBMS", class: "Advanced", genre: "Programming" },
	  { id: 83, name: "Operating System Concepts", author: "Abraham Silberschatz", price: 800, format: "Paperback", subject: "Operating Systems", class: "Advanced", genre: "Programming" },
	  { id: 84, name: "Computer Networks", author: "Andrew S. Tanenbaum", price: 750, format: "Paperback", subject: "Networking", class: "Advanced", genre: "Programming" },
	  { id: 85, name: "Code Complete", author: "Steve McConnell", price: 900, format: "Paperback", subject: "Software Engineering", class: "Advanced", genre: "Programming" },
	  { id: 86, name: "Design Patterns", author: "Erich Gamma", price: 850, format: "Paperback", subject: "Software Design", class: "Advanced", genre: "Programming" },
	  { id: 87, name: "Refactoring", author: "Martin Fowler", price: 800, format: "Paperback", subject: "Software Engineering", class: "Advanced", genre: "Programming" },
	  { id: 88, name: "The Pragmatic Programmer", author: "Andrew Hunt", price: 750, format: "Paperback", subject: "Software Development", class: "Advanced", genre: "Programming" },
	  { id: 89, name: "Introduction to Java Programming", author: "Y. Daniel Liang", price: 700, format: "Paperback", subject: "Java Programming", class: "Beginner", genre: "Programming" },
	  { id: 90, name: "Programming Pearls", author: "Jon Bentley", price: 650, format: "Paperback", subject: "Algorithms", class: "Advanced", genre: "Programming" },
	  { id: 91, name: "Structure and Interpretation of Computer Programs", author: "Harold Abelson", price: 900, format: "Paperback", subject: "Computer Science", class: "Advanced", genre: "Programming" },
	  { id: 92, name: "Grokking Algorithms", author: "Aditya Bhargava", price: 650, format: "Paperback", subject: "Algorithms", class: "Beginner", genre: "Programming" },
	  { id: 93, name: "Hands-On Machine Learning with Scikit-Learn", author: "Aurélien Géron", price: 950, format: "Paperback", subject: "Machine Learning", class: "Advanced", genre: "Programming" },
	  { id: 94, name: "Python for Data Analysis", author: "Wes McKinney", price: 800, format: "Paperback", subject: "Data Science", class: "Advanced", genre: "Programming" },
	  { id: 95, name: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell", price: 950, format: "Paperback", subject: "Artificial Intelligence", class: "Advanced", genre: "Programming" },
	  { id: 96, name: "Deep Learning", author: "Ian Goodfellow", price: 1000, format: "Paperback", subject: "Deep Learning", class: "Advanced", genre: "Programming" },
	  { id: 97, name: "Programming JavaScript Applications", author: "Eric Elliott", price: 650, format: "Paperback", subject: "JavaScript", class: "Intermediate", genre: "Programming" },
	  { id: 98, name: "Full Stack Development with React", author: "Anthony Accomazzo", price: 800, format: "Paperback", subject: "Web Development", class: "Advanced", genre: "Programming" },
	  { id: 99, name: "Spring in Action", author: "Craig Walls", price: 850, format: "Paperback", subject: "Java Framework", class: "Advanced", genre: "Programming" },
	  { id: 100, name: "Hibernate in Action", author: "Gavin King", price: 800, format: "Paperback", subject: "Java Framework", class: "Advanced", genre: "Programming" },
	  { id: 101, name: "Android Programming", author: "Bill Phillips", price: 750, format: "Paperback", subject: "Android Development", class: "Advanced", genre: "Programming" },
	  { id: 102, name: "Kotlin Programming", author: "Big Nerd Ranch", price: 700, format: "Paperback", subject: "Kotlin", class: "Intermediate", genre: "Programming" },
	  { id: 103, name: "Rust Programming", author: "Steve Klabnik", price: 800, format: "Paperback", subject: "Rust Programming", class: "Advanced", genre: "Programming" },
	  { id: 104, name: "Go Programming Language", author: "Alan Donovan", price: 850, format: "Paperback", subject: "Go Programming", class: "Advanced", genre: "Programming" },
	  { id: 105, name: "Clean Architecture", author: "Robert C. Martin", price: 850, format: "Paperback", subject: "Software Architecture", class: "Advanced", genre: "Programming" },
	  { id: 106, name: "System Design Interview", author: "Alex Xu", price: 900, format: "Paperback", subject: "System Design", class: "Advanced", genre: "Programming" },
	  { id: 107, name: "Competitive Programming", author: "Steven Halim", price: 800, format: "Paperback", subject: "Competitive Programming", class: "Advanced", genre: "Programming" },
	  { id: 108, name: "Programming in Java", author: "Sachin Malhotra", price: 520, format: "Paperback", subject: "Java Programming", class: "General", genre: "Programming" },
	  { id: 109, name: "Java Programming for Beginners", author: "Joyce Farrell", price: 540, format: "Paperback", subject: "Java Programming", class: "Beginner", genre: "Programming" },
	  { id: 110, name: "Advanced Java Programming", author: "Uttam K. Roy", price: 620, format: "Paperback", subject: "Java Programming", class: "Advanced", genre: "Programming" },
	  { id: 111, name: "Java EE 8 Application Development", author: "David R. Heffelfinger", price: 780, format: "Paperback", subject: "Java Programming", class: "Advanced", genre: "Programming" },
	  { id: 112, name: "Beginning Java Programming", author: "Barry Burd", price: 650, format: "Paperback", subject: "Java Programming", class: "Beginner", genre: "Programming" },
	  { id: 113, name: "Java Programming Step by Step", author: "John Lewis", price: 600, format: "Paperback", subject: "Java Programming", class: "Beginner", genre: "Programming" },
	  { id: 114, name: "Programming with Java", author: "E. Balagurusamy", price: 580, format: "Paperback", subject: "Java Programming", class: "General", genre: "Programming" },
	  { id: 115, name: "Java in Easy Steps", author: "Mike McGrath", price: 500, format: "Paperback", subject: "Java Programming", class: "Beginner", genre: "Programming" },
	  { id: 116, name: "Java Projects", author: "Kevin Mukhar", price: 550, format: "Paperback", subject: "Java Programming", class: "Intermediate", genre: "Programming" },
	  { id: 117, name: "Modern Java Programming", author: "Benjamin Evans", price: 720, format: "Paperback", subject: "Java Programming", class: "Advanced", genre: "Programming" },
	  { id: 118, name: "HTML5 Programming", author: "Terry Felke-Morris", price: 530, format: "Paperback", subject: "Web Development", class: "Beginner", genre: "Programming" },
	  { id: 119, name: "Mastering HTML", author: "Ray Yao", price: 580, format: "Paperback", subject: "Web Development", class: "Beginner", genre: "Programming" },
	  { id: 120, name: "HTML Web Design", author: "Jon Simmons", price: 520, format: "Paperback", subject: "Web Development", class: "Beginner", genre: "Programming" },
	  { id: 121, name: "CSS Programming", author: "Eric Meyer", price: 560, format: "Paperback", subject: "Web Development", class: "Intermediate", genre: "Programming" },
	  { id: 122, name: "Web Development Basics", author: "Brian Hogan", price: 600, format: "Paperback", subject: "Web Development", class: "Beginner", genre: "Programming" },
	  { id: 123, name: "JavaScript Programming", author: "Chris Minnick", price: 580, format: "Paperback", subject: "JavaScript", class: "Beginner", genre: "Programming" },
	  { id: 124, name: "Advanced JavaScript Programming", author: "Nicholas Zakas", price: 700, format: "Paperback", subject: "JavaScript", class: "Advanced", genre: "Programming" },
	  { id: 125, name: "SQL Programming", author: "Chris Fehily", price: 550, format: "Paperback", subject: "SQL", class: "Beginner", genre: "Programming" },
	  { id: 126, name: "SQL for Beginners", author: "John Patrick", price: 500, format: "Paperback", subject: "SQL", class: "Beginner", genre: "Programming" },
	  { id: 127, name: "Mastering SQL", author: "Rick Silva", price: 620, format: "Paperback", subject: "SQL", class: "Advanced", genre: "Programming" },
	  { id: 128, name: "Database Programming", author: "Paul Atkinson", price: 650, format: "Paperback", subject: "DBMS", class: "Intermediate", genre: "Programming" },
	  { id: 129, name: "Database Design", author: "Adrian Watt", price: 600, format: "Paperback", subject: "DBMS", class: "General", genre: "Programming" },
	  { id: 130, name: "Programming Logic and Design", author: "Joyce Farrell", price: 580, format: "Paperback", subject: "Programming Fundamentals", class: "Beginner", genre: "Programming" },
	  { id: 131, name: "Introduction to Programming", author: "John Zelle", price: 540, format: "Paperback", subject: "Programming Fundamentals", class: "Beginner", genre: "Programming" },
	  { id: 132, name: "Software Engineering Basics", author: "Rajib Mall", price: 620, format: "Paperback", subject: "Software Engineering", class: "General", genre: "Programming" },
	  { id: 133, name: "Software Development Fundamentals", author: "Paul Dorsey", price: 650, format: "Paperback", subject: "Software Engineering", class: "General", genre: "Programming" },
	  { id: 134, name: "Web Programming Guide", author: "Laura Lemay", price: 590, format: "Paperback", subject: "Web Development", class: "Beginner", genre: "Programming" },
	  { id: 135, name: "Frontend Development Guide", author: "Michael W. Brown", price: 610, format: "Paperback", subject: "Web Development", class: "Intermediate", genre: "Programming" },
	  { id: 136, name: "Backend Development Guide", author: "Robert Richards", price: 700, format: "Paperback", subject: "Web Development", class: "Advanced", genre: "Programming" },
	  { id: 137, name: "Programming Principles", author: "Bjarne Stroustrup", price: 780, format: "Paperback", subject: "Programming Fundamentals", class: "Advanced", genre: "Programming" },
	  { id: 138, name: "Programming Concepts", author: "Richard Bird", price: 600, format: "Paperback", subject: "Programming Fundamentals", class: "General", genre: "Programming" },
	  { id: 139, name: "Internet Programming", author: "Deitel & Deitel", price: 720, format: "Paperback", subject: "Web Development", class: "Advanced", genre: "Programming" },
	  { id: 140, name: "Web Technologies", author: "Uttam Roy", price: 550, format: "Paperback", subject: "Web Development", class: "General", genre: "Programming" },
	  { id: 141, name: "Programming Techniques", author: "Brian Kernighan", price: 680, format: "Paperback", subject: "Programming Fundamentals", class: "Advanced", genre: "Programming" },
	  { id: 142, name: "Software Testing", author: "Ron Patton", price: 650, format: "Paperback", subject: "Software Testing", class: "Advanced", genre: "Programming" },
	  { id: 143, name: "Programming Methodology", author: "John Ousterhout", price: 700, format: "Paperback", subject: "Programming Fundamentals", class: "Advanced", genre: "Programming" },
	  { id: 144, name: "Software Project Management", author: "Bob Hughes", price: 750, format: "Paperback", subject: "Software Engineering", class: "Advanced", genre: "Programming" },
	  { id: 145, name: "Programming Applications", author: "David Watt", price: 620, format: "Paperback", subject: "Programming", class: "Intermediate", genre: "Programming" },
	  { id: 146, name: "Programming Systems", author: "Andrew Tanenbaum", price: 800, format: "Paperback", subject: "System Programming", class: "Advanced", genre: "Programming" },
	  { id: 147, name: "Software Design Fundamentals", author: "David Budgen", price: 700, format: "Paperback", subject: "Software Engineering", class: "Advanced", genre: "Programming" },
	  { id: 148, name: "Java Performance Companion", author: "Charlie Hunt", price: 830, format: "Paperback", subject: "Java Programming", class: "Advanced", genre: "Programming" },
	  { id: 149, name: "Modern Java Recipes", author: "Ken Kousen", price: 780, format: "Paperback", subject: "Java Programming", class: "Advanced", genre: "Programming" },
	  { id: 150, name: "Java Coding Problems", author: "Anghel Leonard", price: 820, format: "Paperback", subject: "Java Programming", class: "Advanced", genre: "Programming" },
	  { id: 151, name: "Java Thread Programming", author: "Paul Hyde", price: 760, format: "Paperback", subject: "Java Programming", class: "Advanced", genre: "Programming" },
	  { id: 152, name: "Java Network Programming", author: "Elliotte Rusty Harold", price: 790, format: "Paperback", subject: "Java Programming", class: "Advanced", genre: "Programming" },
	  { id: 153, name: "High Performance Java Persistence", author: "Vlad Mihalcea", price: 880, format: "Paperback", subject: "Java Programming", class: "Advanced", genre: "Programming" },
	  { id: 154, name: "Practical HTML5 Projects", author: "Evan Burchard", price: 640, format: "Paperback", subject: "Web Development", class: "Intermediate", genre: "Programming" },
	  { id: 155, name: "HTML5 Games Development", author: "Makzan", price: 690, format: "Paperback", subject: "Web Development", class: "Advanced", genre: "Programming" },
	  { id: 156, name: "CSS Secrets", author: "Lea Verou", price: 720, format: "Paperback", subject: "Web Development", class: "Advanced", genre: "Programming" },
	  { id: 157, name: "Scalable JavaScript Application Architecture", author: "Nicholas Zakas", price: 750, format: "Paperback", subject: "JavaScript", class: "Advanced", genre: "Programming" },
	  { id: 158, name: "JavaScript Patterns", author: "Stoyan Stefanov", price: 700, format: "Paperback", subject: "JavaScript", class: "Advanced", genre: "Programming" },
	  { id: 159, name: "SQL Performance Explained", author: "Markus Winand", price: 770, format: "Paperback", subject: "SQL", class: "Advanced", genre: "Programming" },
	  { id: 160, name: "High Performance MySQL", author: "Baron Schwartz", price: 850, format: "Paperback", subject: "SQL", class: "Advanced", genre: "Programming" },
	  { id: 161, name: "Database Internals", author: "Alex Petrov", price: 920, format: "Paperback", subject: "DBMS", class: "Advanced", genre: "Programming" },
	  { id: 162, name: "API Design Patterns", author: "JJ Geewax", price: 840, format: "Paperback", subject: "Software Engineering", class: "Advanced", genre: "Programming" },
	  { id: 163, name: "Software Architecture in Practice", author: "Len Bass", price: 890, format: "Paperback", subject: "Software Architecture", class: "Advanced", genre: "Programming" },
	  { id: 164, name: "Secure Coding in Java", author: "Robert Seacord", price: 860, format: "Paperback", subject: "Java Programming", class: "Advanced", genre: "Programming" },
	  { id: 165, name: "Web Scalability for Startup Engineers", author: "Artur Ejsmont", price: 780, format: "Paperback", subject: "Web Development", class: "Advanced", genre: "Programming" },
	  { id: 166, name: "Practical SQL", author: "Anthony DeBarros", price: 690, format: "Paperback", subject: "SQL", class: "Intermediate", genre: "Programming" },
	  { id: 167, name: "Release It! Design and Deploy Production Systems", author: "Michael Nygard", price: 870, format: "Paperback", subject: "Software Engineering", class: "Advanced", genre: "Programming" },
	  { id: 168, name: "Bhagavad Gita", author: "Vyasa", price: 299, format: "Paperback", subject: "Scripture", class: "General", genre: "Scripture" },
	  { id: 169, name: "Ramayana", author: "Valmiki", price: 499, format: "Hardcover", subject: "Scripture", class: "General", genre: "Scripture" },
	  { id: 170, name: "Mahabharata", author: "Vyasa", price: 599, format: "Hardcover", subject: "Scripture", class: "General", genre: "Scripture" },
	  { id: 171, name: "The Holy Bible", author: "Various Authors", price: 399, format: "Paperback", subject: "Scripture", class: "General", genre: "Scripture" },
	  { id: 172, name: "The Quran", author: "Various Authors", price: 450, format: "Hardcover", subject: "Scripture", class: "General", genre: "Scripture" },
	  { id: 173, name: "The Rigveda", author: "Ancient Sages", price: 550, format: "Hardcover", subject: "Scripture", class: "General", genre: "Scripture" }
];

// Helper to save to Browser Storage
function saveBooks(books) {
  localStorage.setItem('booknook_catalog', JSON.stringify(books));
}

// 2. READ: Get All Books (Bridge to Java)
async function getBooks() {
  try {
    const response = await fetch('GetBooksServlet');
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("Server unavailable, falling back to local cache.");
  }
  
  const local = localStorage.getItem('booknook_catalog');
  return local ? JSON.parse(local) : SEED_BOOKS;
}

// 3. CREATE: Add New Book
async function addBook(book) {
  try {
    const response = await fetch('AddBookServlet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    });
    if (response.ok) return await response.json();
  } catch (e) {
    console.error("Local mode: Adding book to browser cache.");
  }

  const books = await getBooks();
  const newBook = { ...book, id: Date.now() }; // Using timestamp as unique ID
  books.push(newBook);
  saveBooks(books);
  return newBook;
}

// 4. UPDATE: Modify Book Data
async function updateBook(id, updates) {
  try {
    const response = await fetch(`UpdateBookServlet?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.ok;
  } catch (e) {
    const books = await getBooks();
    const index = books.findIndex(b => b.id === id);
    if (index !== -1) {
      books[index] = { ...books[index], ...updates };
      saveBooks(books);
      return true;
    }
    return false;
  }
}

// 5. DELETE: Remove Book
async function deleteBook(id) {
  try {
    const response = await fetch(`DeleteBookServlet?id=${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (e) {
    const books = await getBooks();
    const filtered = books.filter(b => b.id !== id);
    saveBooks(filtered);
    return true;
  }
}

// Attach to Window for access across other JS files
window.getBooks = getBooks;
window.addBook = addBook;
window.updateBook = updateBook;
window.deleteBook = deleteBook;