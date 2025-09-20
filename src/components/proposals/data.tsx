import { faker } from "@faker-js/faker";

export const mockProposals = Array.from({ length: 100 }, (_, i) => {
  const authorUuid = faker.string.uuid();
  const categoryUuid = faker.string.uuid();
  const paperUuid = faker.string.uuid();

  return {
    uuid: paperUuid,
    title: faker.lorem.sentence(6),
    abstract_text: faker.lorem.paragraphs(2),
    author_uuid: authorUuid,
    author: {
      uuid: authorUuid,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      department: faker.commerce.department(),
      profile_picture: faker.image.avatar(),
      bio: faker.lorem.sentences(3),
    },
    category_uuid: categoryUuid,
    category: faker.commerce.productName(),
    submitted_at: faker.date.between({ from: "2024-01-01", to: "2024-02-01" }).toISOString().split("T")[0],
    created_at: faker.date.between({ from: "2024-01-01", to: "2024-01-20" }).toISOString().split("T")[0],
    status: faker.helpers.arrayElement(["Under Review", "Pending Review", "Approved", "Rejected"]),
    is_approved: faker.datatype.boolean(),
    assigned_uuid: faker.datatype.boolean() ? faker.string.uuid() : null,
    thumbnail_url: faker.image.urlPicsumPhotos(),
    file_url: `/papers/${faker.word.noun()}-${i + 1}.pdf`,
    download_count: faker.number.int({ min: 0, max: 200 }),
  };
});

export const mockAdvisors = Array.from({ length: 100 }, (_, i) => {
  const uuid = `advisor-${i + 1}`;
  const yearsExperience = faker.number.int({ min: 5, max: 25 });
  const maxCapacity = faker.number.int({ min: 5, max: 12 });
  const currentCapacity = faker.number.int({ min: 0, max: maxCapacity });

  return {
    uuid,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    department: faker.helpers.arrayElement([
      "Computer Science",
      "Data Science",
      "Environmental Engineering",
      "Biomedical Engineering",
      "Artificial Intelligence",
      "Robotics",
      "Cybersecurity",
      "Software Engineering",
      "Physics",
      "Business Administration",
      "Atmospheric Science",
      "Healthcare Management",
      "Information Systems",
    ]),
    specialization: faker.helpers.arrayElement([
      "Machine Learning, AI Ethics",
      "Deep Learning, Computer Vision",
      "Renewable Energy, Sustainability",
      "Medical Devices, Healthcare Technology",
      "Algorithms, Optimization",
      "Natural Language Processing, Computational Linguistics",
      "Statistical Learning, Bayesian Methods",
      "Autonomous Systems, Control Theory",
      "Network Security, Cryptography",
      "Distributed Systems, Cloud Computing",
      "Quantum Computing, Quantum Information",
      "Digital Transformation, Innovation Management",
      "Climate Modeling, Environmental Data Analysis",
      "Healthcare Analytics, Process Optimization",
      "Blockchain Technology, Distributed Ledgers",
    ]),
    profile_picture: faker.image.avatar(),
    bio: faker.lorem.sentences(3),
    papers_supervised: faker.number.int({ min: 5, max: 30 }),
    rating: faker.number.float({ min: 4.5, max: 5.0, fractionDigits: 1 }),
    years_experience: yearsExperience,
    current_capacity: currentCapacity,
    max_capacity: maxCapacity,
  };
});


