import Query from "../modals/query.modal.js";

class QueryService {
    async createQuery(data) {
        const newQuery = new Query(data);
        return await newQuery.save();
    }

    async getAllQueries() {
        return await Query.find().populate('bookingId userId busBookingId');
    }

    async updateQuery(queryId, updateData) {
        try {
            const updatedQuery = await Query.findByIdAndUpdate(queryId, updateData, { new: true });
            if (!updatedQuery) {
                throw new Error('Query not found');
            }
            return updatedQuery;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

export default new QueryService();