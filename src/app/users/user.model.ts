export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive';
}

export const MOCK_USERS: User[] = [
  { id: '1', firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com', role: 'admin', status: 'active' },
  { id: '2', firstName: 'Bob', lastName: 'Smith', email: 'bob.smith@example.com', role: 'editor', status: 'active' },
  { id: '3', firstName: 'Carol', lastName: 'Williams', email: 'carol.williams@example.com', role: 'viewer', status: 'inactive' },
  { id: '4', firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com', role: 'editor', status: 'active' },
  { id: '5', firstName: 'Eva', lastName: 'Davis', email: 'eva.davis@example.com', role: 'viewer', status: 'active' },
  { id: '6', firstName: 'Frank', lastName: 'Miller', email: 'frank.miller@example.com', role: 'admin', status: 'active' },
  { id: '7', firstName: 'Grace', lastName: 'Wilson', email: 'grace.wilson@example.com', role: 'viewer', status: 'inactive' },
  { id: '8', firstName: 'Henry', lastName: 'Moore', email: 'henry.moore@example.com', role: 'editor', status: 'active' },
  { id: '9', firstName: 'Irene', lastName: 'Taylor', email: 'irene.taylor@example.com', role: 'viewer', status: 'active' },
  { id: '10', firstName: 'Jack', lastName: 'Anderson', email: 'jack.anderson@example.com', role: 'admin', status: 'active' },
  { id: '11', firstName: 'Karen', lastName: 'Thomas', email: 'karen.thomas@example.com', role: 'editor', status: 'inactive' },
  { id: '12', firstName: 'Leo', lastName: 'Jackson', email: 'leo.jackson@example.com', role: 'viewer', status: 'active' },
  { id: '13', firstName: 'Mia', lastName: 'White', email: 'mia.white@example.com', role: 'editor', status: 'active' },
  { id: '14', firstName: 'Noah', lastName: 'Harris', email: 'noah.harris@example.com', role: 'viewer', status: 'inactive' },
  { id: '15', firstName: 'Olivia', lastName: 'Martin', email: 'olivia.martin@example.com', role: 'admin', status: 'active' },
  { id: '16', firstName: 'Paul', lastName: 'Garcia', email: 'paul.garcia@example.com', role: 'viewer', status: 'active' },
  { id: '17', firstName: 'Quinn', lastName: 'Martinez', email: 'quinn.martinez@example.com', role: 'editor', status: 'active' },
  { id: '18', firstName: 'Rachel', lastName: 'Robinson', email: 'rachel.robinson@example.com', role: 'viewer', status: 'inactive' },
  { id: '19', firstName: 'Sam', lastName: 'Clark', email: 'sam.clark@example.com', role: 'admin', status: 'active' },
  { id: '20', firstName: 'Tina', lastName: 'Lewis', email: 'tina.lewis@example.com', role: 'editor', status: 'active' },
  { id: '21', firstName: 'Uma', lastName: 'Lee', email: 'uma.lee@example.com', role: 'viewer', status: 'active' },
  { id: '22', firstName: 'Victor', lastName: 'Walker', email: 'victor.walker@example.com', role: 'admin', status: 'inactive' },
  { id: '23', firstName: 'Wendy', lastName: 'Hall', email: 'wendy.hall@example.com', role: 'editor', status: 'active' },
  { id: '24', firstName: 'Xander', lastName: 'Allen', email: 'xander.allen@example.com', role: 'viewer', status: 'active' },
  { id: '25', firstName: 'Yara', lastName: 'Young', email: 'yara.young@example.com', role: 'editor', status: 'active' },
];
