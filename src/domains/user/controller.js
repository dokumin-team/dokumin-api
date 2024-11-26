const UserCollection = require("./model");
const hashData = require("../../util/hashData");
const verifyHashedData = require("../../util/verifyHashedData");

const createNewUser = async (data) => {
  try {
    const { name, email, password } = data;

    // Check if the user exists
    const existingUserSnapshot = await UserCollection.where("email", "==", email).get();
    if (!existingUserSnapshot.empty) {
      throw Error("User with the provided email already exists!");
    }

    // Hash Password
    const hashedPassword = await hashData(password);

    // Create new user document
    const newUser = {
      name,
      email,
      password: hashedPassword,
      verified: false,
    };

    // Add to Firestore
    const createdUserRef = await UserCollection.add(newUser);
    return { id: createdUserRef.id, ...newUser };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const authenticateUser = async (email, password) => {
  try {
    const userSnapshot = await UserCollection.where("email", "==", email).limit(1).get();

    if (userSnapshot.empty) {
      throw Error("Email or password is incorrect!");
    }

    const userDoc = userSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    if (!user.verified) {
      throw Error("Email has not been verified yet. Check your inbox!");
    }

    // Verify the hashed password
    const passwordMatch = await verifyHashedData(password, user.password);
    if (!passwordMatch) {
      throw Error("Email or password is incorrect!");
    }

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { createNewUser, authenticateUser };
