const follow = require("../models/follow");

const followUserIds = async (identityUserId) => {
    
    // Sacar la información de Seguimiento
    let following
    try {
        following = await follow.find({ "user": identityUserId,  })
            .select({"followed": 1, "_id":0})
            .exec();
            
    } catch (error) {
        console.error(error);
        throw error;
    }

    let followers 
    try {
        followers = await follow.find({ "followed": identityUserId,  })
            .select({"user": 1, "_id":0})
            .exec();
            
    } catch (error) {
        console.error(error);
        throw error;
    }

    // Procesar array de identificadorews
    let followingClean = []
    following.forEach(follow =>{
        followingClean.push(follow.followed)
    })
    let followersClean = []
    followers.forEach(follow =>{
        followersClean.push(follow.user)
    })

    return {
        following: followingClean,
        followers: followersClean
    };
};

const followThisUser = async (identityUserId, profileUserId) => {
    // Implementa la lógica para seguir al usuario con el profileUserId
    // Sacar la información de Seguimiento
    let following
    try {
        // si estoy siguiendo 
        following = await follow.findOne({ "user": identityUserId, "followed": profileUserId })
            
    } catch (error) {
        console.error(error);
        throw error;
    }

    let followers 
    try {
        // Me sigue
        followers = await follow.findOne({ "user": profileUserId, "followed": identityUserId,  })
            
    } catch (error) {
        console.error(error);
        throw error;
    }
    return {
        following,
        followers
    }
};

module.exports = {
    followUserIds,
    followThisUser
};