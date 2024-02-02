const follow = require("../models/follow");

const followUserIds = async (identityUserId) => {
    let following
    try {
        following = await follow.find({ "user": identityUserId,  })
            .select({"followed": 1, "_id":0})
            .exec();
            console.log("Following:", following)
    } catch (error) {
        console.error(error);
        throw error;
    }

    const followers = false;
    return {
        following,
        followers
    };
};

const followThisUser = async (identityUserId, profileUserId) => {
    // Implementa la lógica para seguir al usuario con el profileUserId
};

module.exports = {
    followUserIds,
    followThisUser
};