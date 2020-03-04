'use strict';
class QueryBuilder{
    constructor(sequelize){
        this.query='';
        this.tbl;
        this.queryInital='*';
        this.whereParams;
        this.orWhereParams;
        this.joinQry;
        this.sequelize = sequelize;
    }
    async rawQuery(query){
        try{
            if(this.sequelize){
                return await this.sequelize.query(query, { type: this.sequelize.QueryTypes.SELECT});
            }else{
                return 'Error - Sequelize connection not found, Please create sequelize connection and pass it to query builder constructor.';
            }
        }catch(err){
            return err;
        }
    }
    
    async get(){
        const qry = `SELECT ${this.queryInital? this.queryInital : '*'} from ${this.tbl} ${this.joinQry? this.joinQry : ''} ${this.query? 'where'+this.query : ''}`;
        return await this.rawQuery(qry);
    }
    async raw(qry){
        return await this.rawQuery(qry);
    }
    getRaw(){
        const qry = `SELECT ${this.queryInital? this.queryInital : '*'} from ${this.tbl} ${this.joinQry? this.joinQry : ''} ${this.query? 'where'+this.query : ''}`;
        return qry;
    }
    join(){
        this.joinQry = `${(this.joinQry?this.joinQry : '')} inner join ${arguments[0]} on ${arguments[1]}=${arguments[2]}`;
        return this;
    }
    leftJoin(){
        this.joinQry = `${(this.joinQry?this.joinQry : '')} left join ${arguments[0]} on ${arguments[1]}=${arguments[2]}`;
        return this;
    }
    rightJoin(){
        this.joinQry = `${(this.joinQry?this.joinQry : '')} right join ${arguments[0]} on ${arguments[1]}=${arguments[2]}`;
        return this;
    }
    orderBy(){
        this.query = `${(this.query?this.query : '')} Order by ${arguments[0]} ${arguments[1]? arguments[1] : 'ASC'}`;
        return this;
    }
    groupBy(){
        this.query = `${(this.query?this.query : '')} group by ${Object.values(arguments).join(",")}`;
        return this;
    }
    select(){
       this.queryInital = Object.values(arguments).join(",");
       return this;
    }
    table(table){
        this.tbl=table;
        this.query='';
        this.queryInital='*';
        this.whereParams=undefined;
        this.orWhereParams=undefined;
        return this;
    }
    getStrParam(param){
        return isNaN(param) && !(/\(/.test(param)) ? `"${param}"` : param ;
    }
    where(callback){
        if(arguments[0] instanceof Function){
            this.query = `${(this.query?this.query + ' AND': '')} (`;
            this.whereParams=undefined;
            callback(this);
            this.query += ' )';
        }else{
            const operatorAndVal = arguments.length>2? ` ${arguments[1]} ${this.getStrParam(arguments[2])}`: ` = ${this.getStrParam(arguments[1])}`;
            
            if(this.whereParams){
                const qryString = ` AND ${arguments[0]}${operatorAndVal}`;
                this.whereParams.push(qryString);
                this.query+= qryString;
            }else{
                const qryString = [arguments[0]+operatorAndVal];
                this.whereParams = qryString;
                this.query = `${(this.query?this.query : '')} ${qryString}`
            }
        }
        return this;
    }
    orWhere(){
        const operatorAndVal = arguments.length>2? ` ${arguments[1]} ${this.getStrParam(arguments[2])}`: ` = ${this.getStrParam(arguments[1])}`;
        if(this.orWhereParams){
            const qryString = ` OR ${arguments[0]}${operatorAndVal}`;
            this.orWhereParams.push(qryString);
            this.query+= qryString;
        }else{
            const qryString = [arguments[0]+operatorAndVal];
            this.orWhereParams = qryString;
            this.query = `${(this.query?this.query : '')} ${qryString}`
        }
        return this;
    }
    orWhereNull(){
        this.query = `${(this.query?this.query+' OR ' : ' ')}${arguments[0]} IS NULL`;
        return this;
    }
    orWhereIn(){
        this.query = `${(this.query?this.query+' OR ' : ' ')} ${arguments[0]} IN (${Array.isArray(arguments[1])? arguments[1].join(",") : this.getStrParam(arguments[1])})`;
        return this;
    }
    orWhereNotNull(){
        this.query = `${(this.query?this.query+' OR ' : ' ')}${arguments[0]} IS NOT NULL`;
        return this;
    }
    orWhereNot(){
        this.query = `${(this.query?this.query+' OR ' : ' ')}${arguments[0]} <> ${this.getStrParam(arguments[1])}`;
        return this;
    }
    whereNot(){
        this.query = `${(this.query?this.query+' AND ' : ' ')}${arguments[0]} <> ${this.getStrParam(arguments[1])}`;
        return this;
    }
    whereNull(){
        this.query = `${(this.query?this.query : '')} ${arguments[0]} IS NULL`;
        return this;
    }
    whereNotNull(){
        this.query = `${(this.query?this.query : '')} ${arguments[0]} IS NOT NULL`;
        return this;
    }
    beginTransaction(){
        this.query = `${(this.query?this.query+' AND ' : ' ')}${arguments[0]} <> ${this.getStrParam(arguments[1])}`;
        return this;
    }
    commit(){
        this.query = `${(this.query?this.query : '')} ${arguments[0]} IS NULL`;
        return this;
    }
    rollback(){
        this.query = `${(this.query?this.query : '')} ${arguments[0]} IS NOT NULL`;
        return this;
    }
    transaction(){
        this.query = `${(this.query?this.query : '')} ${arguments[0]} IS NOT NULL`;
        return this;
    }

    whereIn(){
        this.query = `${(this.query?this.query : '')} ${arguments[0]} IN (${Array.isArray(arguments[1])? arguments[1].join(",") : this.getStrParam(arguments[1])})`;
        return this;
    }
    whereNotIn(){
        this.query = `${(this.query?this.query : '')} ${arguments[0]} NOT IN (${Array.isArray(arguments[1])? arguments[1].join(",") : this.getStrParam(arguments[1])})`;
        return this;
    }
    whereBetween(){
        const between = arguments.length==3?  arguments[1] + ' AND ' + arguments[2] : Array.isArray(arguments[1])? arguments[1][0] + ' AND ' + arguments[1][1] : '';
        this.query = `${(this.query?this.query : '')} BETWEEN ${between}`;
        return this;
    }
    whereNotBetween(){
        const between = arguments.length==3?  arguments[1] + ' AND ' + arguments[2] : Array.isArray(arguments[1])? arguments[1][0] + ' AND ' + arguments[1][1] : '';
        this.query = `${(this.query?this.query : '')} NOT BETWEEN ${between}`;
        return this;
    }
    leftOuterJoin(){
        this.joinQry = `${(this.joinQry?this.joinQry : '')} left outer join ${arguments[0]} on ${arguments[1]}=${arguments[2]}`;
        return this;
    }
    rightOuterJoin(){
        this.joinQry = `${(this.joinQry?this.joinQry : '')} right outer join ${arguments[0]} on ${arguments[1]}=${arguments[2]}`;
        return this;
    }
    outerJoin(){
        this.joinQry = `${(this.joinQry?this.joinQry : '')} outer join ${arguments[0]} on ${arguments[1]}=${arguments[2]}`;
        return this;
    }
    fullOuterJoin(){
        this.joinQry = `${(this.joinQry?this.joinQry : '')} full outer join ${arguments[0]} on ${arguments[1]}=${arguments[2]}`;
        return this;
    }
    crossJoin(){
        this.joinQry = `${(this.joinQry?this.joinQry : '')} CROSS join ${arguments[0]} on ${arguments[1]}=${arguments[2]}`;
        return this;
    }
    distinct(){
        this.query = `${(this.query?this.query : '')} DISTINCT(${arguments[0]}) `;
        return this;
    }
    having(){
        this.query = `${(this.query?this.query : '')} HAVING ${arguments[0]} ${arguments[1]} ${arguments[2]}`;
        return this;
    }
    whereExists(){
        if(arguments[0] instanceof Function){
            this.query = `${(this.query?this.query : '')}  EXISTS (`;
            callback(this);
            this.query += ' )';
        }
        return this;
    }
    whereNotExists(){
        if(arguments[0] instanceof Function){
            this.query = `${(this.query?this.query : '')}  NOT EXISTS (`;
            callback(this);
            this.query += ' )';
        }
        return this;
    }
    from(tbl){
        this.query = `${(this.query?this.query : '')} SELECT * from ${tbl} `;
        return this;
    }
    update(){
        this.query = `${(this.query?this.query : '')} HAVING ${arguments[0]} ${arguments[1]} ${arguments[2]}`;
        return this;
    }
    insert(){
        this.query = `${(this.query?this.query : '')} HAVING ${arguments[0]} ${arguments[1]} ${arguments[2]}`;
        return this;
    }
    delete(){
        this.query = `${(this.query?this.query : '')} HAVING ${arguments[0]} ${arguments[1]} ${arguments[2]}`;
        return this;
    }
    truncate(){
        this.query = `${(this.query?this.query : '')} HAVING ${arguments[0]} ${arguments[1]} ${arguments[2]}`;
        return this;
    }
    search(){
        if(Array.isArray(arguments[0])){
            for(let field of arguments[0]){
                this.orWhere(field, 'like', `"%${arguments[1]}%"`);
            }
        }else{
            this.orWhere(arguments[0],'like', `"%${arguments[1]}%"`);
        }
        return this;
    }
    async paginate(){
        const qry = `SELECT ${this.queryInital? this.queryInital : '*'} from ${this.tbl} ${this.joinQry? this.joinQry : ''} ${this.query? 'where'+this.query : ''}`;
        const recordCount = await this.rawQuery(`select count(*) as count from ${this.tbl} ${this.joinQry? this.joinQry : ''} ${this.query? 'where'+this.query : ''}`);
        const page = arguments[0]? arguments[0] : 1, pageSize=arguments[1]?arguments[1] : 10;
        const result = await this.rawQuery(`${qry} LIMIT ${pageSize} OFFSET ${pageSize*(page-1)}`);
        return {
            result: result,
            pages: recordCount? Math.ceil(recordCount[0].count/pageSize) : 0,
            currentPage: page,
            perPage: pageSize,
            lastPage: recordCount? Math.ceil(recordCount[0].count/pageSize) : 0
            };
    }
    offset(){
        this.query = `${(this.query?this.query : '')} OFFSET ${arguments[0]} `;
        return this;
    }
    limit(){
        this.query = `${(this.query?this.query : '')} LIMIT ${arguments[0]} `;
        return this;
    }
    async count(){
        const param = (arguments[0]? `(${arguments[0]})` : '(id)') + `as ${arguments[1]? arguments[1] : 'count'}`;
        const qry = `SELECT count${param} ${this.queryInital? ',' + this.queryInital : ''} from ${this.tbl} ${this.joinQry? this.joinQry : ''} ${this.query? 'where'+this.query : ''}`;
        return await this.rawQuery(qry);
    }
    async countDistinct(){
        const param = (arguments[0]? `(DISTINCT ${arguments[0]})` : '(DISTINCT id)') + `as ${arguments[1]? arguments[1] : 'count'}`;
        const qry = `SELECT count${param} ${this.queryInital? ',' + this.queryInital : ''} from ${this.tbl} ${this.joinQry? this.joinQry : ''} ${this.query? 'where'+this.query : ''}`;
        return await this.rawQuery(qry);
    }
    async min(){
        const param = (arguments[0]? `(${arguments[0]})` : '(id)') + `as ${arguments[1]? arguments[1] : 'min'}`;
        const qry = `SELECT MIN${param} ${this.queryInital? ',' + this.queryInital : ''} from ${this.tbl} ${this.joinQry? this.joinQry : ''} ${this.query? 'where'+this.query : ''}`;
        return await this.rawQuery(qry);
    }
    async max(){
        const param = (arguments[0]? `(${arguments[0]})` : '(id)') + `as ${arguments[1]? arguments[1] : 'min'}`;
        const qry = `SELECT MAX${param} ${this.queryInital? ',' + this.queryInital : ''} from ${this.tbl} ${this.joinQry? this.joinQry : ''} ${this.query? 'where'+this.query : ''}`;
        return await this.rawQuery(qry);
    }
    async avg(){
        const param = (arguments[0]? `(${arguments[0]})` : '(id)') + `as ${arguments[1]? arguments[1] : 'avg'}`;
        const qry = `SELECT AVG${param} ${this.queryInital? ',' + this.queryInital : ''} from ${this.tbl} ${this.joinQry? this.joinQry : ''} ${this.query? 'where'+this.query : ''}`;
        return await this.rawQuery(qry);
    }
    async sum(){
        const param = (arguments[0]? `(${arguments[0]})` : '(id)') + `as ${arguments[1]? arguments[1] : 'sum'}`;
        const qry = `SELECT SUM${param} ${this.queryInital? ',' + this.queryInital : ''} from ${this.tbl} ${this.joinQry? this.joinQry : ''} ${this.query? 'where'+this.query : ''}`;
        return await this.rawQuery(qry);
    }
    async list(){
        const qry = `SELECT ${arguments[0]} from ${this.tbl} ${this.joinQry? this.joinQry : ''} ${this.query? 'where'+this.query : ''}`;
        const result =  await this.rawQuery(qry);
        const finalResult = result.map(a => a[arguments[0]]);
        return finalResult;
    }
    async first(){
        const qry = `SELECT ${this.queryInital? this.queryInital : '*'} from ${this.tbl} ${this.joinQry? this.joinQry : ''} ${this.query? 'where'+this.query : ''} LIMIT 1`;
        return await this.rawQuery(qry);
    }
} 

module.exports = QueryBuilder;