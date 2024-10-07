import queryService from "../service/query.service.js";

class QueryController {
    async createQuery(req, res) {
        try {
            const newQuery = await queryService.createQuery(req.body);
            res.status(201).json(newQuery);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating query', error });
        }
    }

    async getAllQueries(req, res) {
        try {
            const queries = await queryService.getAllQueries();
            res.status(200).json(queries);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching queries', error });
        }
    }

    async updateQuery(req,res){
        try {
            const queries = await queryService.updateQuery(req.body.queryId, req.body.data);
            res.status(200).json(queries);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching queries', error });
        }
    }
}

export default new QueryController();