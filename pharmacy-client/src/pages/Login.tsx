// Mock user database
const mockUsers = [
    {
      id: "1",
      email: "pharmacy@example.com",
      password: "pharmacy123", // In a real app, never store plain passwords!
      name: "Pharmacy Admin",
      address: {
        street: "123 Medical St",
        city: "Healthville",
        state: "HV",
        zip: "12345"
      },
      phone: "555-123-4567"
    }
  ];
  
  export const AuthService = {
    getCurrentUser: () => {
      const user = localStorage.getItem("currentUser");
      return user ? JSON.parse(user) : null;
    },
  
    login: async (email: string, password: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = mockUsers.find(
        user => user.email === email && user.password === password
      );
  
      if (!user) {
        throw new Error("Invalid email or password");
      }
  
      // Store user in localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));
      return user;
    },
  
    logout: () => {
      localStorage.removeItem("currentUser");
    }
  };
  
  // Other services can remain unchanged
  export const VendorService = { /* ... */ };
  export const MedicationService = { /* ... */ };
  export const OrderService = { /* ... */ };