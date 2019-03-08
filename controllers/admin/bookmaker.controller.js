const Tags = require('../../models/Bookmaker_tags');
const Bookmakers = require('../../models/Bookmaker');
const BettingMarkets = require('../../models/Betting_markets');
const BettingCompetition = require('../../models/Betting_competition');
const BettingMatches = require('../../models/Betting_matches');
const BettingExotic = require('../../models/Betting_exotic');
const BettingLayunovodds = require('../../models/Betting_layunovodds');
const AdditionalTags = require('../../models/Tags');
const BettingSharbsOdds = require('../../models/Betting_sharbs_odds');
const { getToken, genRandomPassword, convertToSlug } = require('../../utils/api.helpers');
var md5 = require('md5');
const path = require('path');



function createBookmaker(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { bm_name, bm_tag, bm_affiliate_link, bm_id } = body;
        if (!bm_name) return res.status(400).send({ success: false, message: 'Please enter the name.' });
        Bookmakers.find({ bm_name: bm_name }).then(existCat => {
            if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Bookmaker name already exists.' });
            const newBookmaker = new Bookmakers();
            newBookmaker.bm_name = bm_name;
            newBookmaker.bm_tag = bm_tag;
            newBookmaker.bm_affiliate_link = bm_affiliate_link;
            newBookmaker.bm_id = bm_id;

            let newFileName = '';
            if (req.files) {
                let bm_logo = req.files.file;
                let imageName = req.files.file.name;
                let imageExt = imageName.split('.').pop();
                newFileName = md5(genRandomPassword(10) + Date.now()) + '.' + imageExt;
                let filename = path.join(__dirname, '../../uploads/bookmaker/' + newFileName);
                bm_logo.mv(filename);
                newBookmaker.bm_logo = newFileName;
            }

            newBookmaker.save((err) => {
                if (err) {
                    return res.status(400).send({ success: true, msg: 'Server error!' });
                }
                return res.status(201).send({ success: true, msg: 'Bookmaker created successfully!' });
            });

        }).catch((err) => {
            console.log('err', err);
            return res.status(400).send({ success: false, msg: err });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateBookmakers(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id, bm_name, bm_tag, bm_affiliate_link, bm_id } = body;
        if (!bm_name) return res.status(400).send({ success: false, message: 'Please enter the name.' });

        Bookmakers.findById({
            _id: _id
        }).then(tagRow => {
            if (!tagRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            Bookmakers.find({ bm_name: bm_name, _id: { $ne: _id } })
                .then(existCat => {
                    if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Bookmaker name  already exists.' });
                    let updateData = {};
                    updateData.bm_name = bm_name;
                    updateData.bm_name = bm_name;
                    updateData.bm_tag = bm_tag;
                    updateData.bm_affiliate_link = bm_affiliate_link;
                    updateData.bm_id = bm_id;

                    let newFileName = '';
                    if (req.files) {
                        let bm_logo = req.files.file;
                        let imageName = req.files.file.name;
                        let imageExt = imageName.split('.').pop();
                        newFileName = md5(genRandomPassword(10) + Date.now()) + '.' + imageExt;
                        let filename = path.join(__dirname, '../../uploads/bookmaker/' + newFileName);
                        bm_logo.mv(filename);
                        updateData.bm_logo = newFileName;
                    }
                    Bookmakers.findByIdAndUpdate({ _id: tagRow._id }, { $set: updateData })
                        .then(() => {
                            return res.status(201).send({ success: true, msg: 'Bookmaker updated successfully' });
                        }).catch(() => {
                            return res.status(500).send({ success: false, msg: 'server error' })
                        })
                }).catch(() => {
                    return res.status(500).send({ success: false, msg: 'server error' })
                })
        }).catch(err => {
            if (err.status === 404) res.status(400).send({ success: false, msg: err.msg })
            else return next({ status: 500, msg: 'server error' })
        })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function getBookmakers(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = {};
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }

        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { bm_name: -1 };
        }

        Bookmakers.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                Bookmakers.countDocuments(query)
                    .then(totalCounts => {
                        return res.status(200).send({ success: true, results: results, totalCount: totalCounts });
                    });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}



function updateBookmakerStatus(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        Bookmakers.findById({ _id }).then(tagRow => {
            if (!tagRow) throw { status: 400, msg: 'Invalid request.' };


            Bookmakers.findByIdAndRemove({ _id: tagRow._id })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Bookmaker deleted successfully!' });
                }).catch(() => {
                    return res.json({ success: false, msg: 'Server error' });
                });

        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getBookmakerRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        Bookmakers.findById(req.query._id).then(tagRow => {
            if (tagRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': tagRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


/** bookmaker tags* */
function createTag(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { tagName } = body.tagData;
        if (!tagName) return res.status(400).send({ success: false, message: 'Please enter the name.' });
        Tags.find({ tagName: tagName, deleted: 0 }).then(existCat => {
            if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Tag name already exists.' });
            const newBookmaker = new Tags();
            newBookmaker.tagName = tagName;


            newBookmaker.save((err) => {
                if (err) {
                    return res.status(400).send({ success: true, msg: 'Server error!' });
                }
                return res.status(201).send({ success: true, msg: 'Tag created successfully!' });
            });

        }).catch(() => {

            return res.status(400).send({ success: false, msg: 'Server error 11 ' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateTags(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id, tagName } = body.tagData;
        if (!tagName) return res.status(400).send({ success: false, message: 'Please enter the name.' });

        Tags.findById({
            _id: _id
        }).then(tagRow => {
            if (!tagRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            Tags.find({ tagName: tagName, deleted: 0, _id: { $ne: _id } })
                .then(existCat => {
                    if (existCat.length > 0) return res.status(400).send({ success: false, msg: 'Tag name  already exists.' });
                    let updateData = {};
                    updateData.tagName = tagName;
                    Tags.findByIdAndUpdate({ _id: tagRow._id }, { $set: updateData })
                        .then(() => {
                            return res.status(201).send({ success: true, msg: 'Tag updated successfully' });
                        }).catch(() => {
                            return res.status(500).send({ success: false, msg: 'server error' })
                        })
                }).catch(() => {
                    return res.status(500).send({ success: false, msg: 'server error' })
                })
        }).catch(err => {
            if (err.status === 404) res.status(400).send({ success: false, msg: err.msg })
            else return next({ status: 500, msg: 'server error' })
        })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function getTags(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = {};
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }

        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { tagName: -1 };
        }

        Tags.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                Tags.countDocuments(query)
                    .then(totalCounts => {
                        return res.status(200).send({ success: true, results: results, totalCount: totalCounts });
                    });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function updateTagStatus(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        Tags.findById({ _id }).then(tagRow => {
            if (!tagRow) throw { status: 400, msg: 'Invalid request.' };


            Tags.findByIdAndRemove({ _id: tagRow._id })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Tag deleted successfully!' });
                }).catch(() => {
                    return res.json({ success: false, msg: 'Server error' });
                });

        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getTagRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        Tags.findById(req.query._id).then(tagRow => {
            if (tagRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': tagRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });

    }
}
function getAllTags(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let query = {};
        let sortQ = {};
        sortQ = { name: 1 };
        Tags.find(query).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [] });
                return res.status(200).send({ success: true, results: results });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getAllLeagus(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let query = { c_active: 1 };
        let sortQ = {};

        BettingCompetition.find(query).sort(sortQ)
            .then(results => {
                Bookmakers.find()
                    .then(bookTags => {
                        AdditionalTags.find()
                            .then(tags => {
                                return res.status(200).send({ success: true, results: results, bookTags: bookTags, tags: tags });
                            })

                    })

            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getAllMatches(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let query = { match_cid: req.query.comp_id, match_deleted: 0 };
        BettingMatches.find(query)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [] });
                return res.status(200).send({ success: true, results: results });
            }).catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getMarkets(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let query = { exodds_cid: req.query.odds_cid, exodds_matchid: req.query.odds_matchid };
        if (req.query.odds_market) {
            query.exodds_market = req.query.odds_market;
        }
        let lquery = { layunov_cid: req.query.odds_cid, layunov_matchid: req.query.odds_matchid };
        BettingExotic.find(query).populate('markets').then(results => {
            BettingLayunovodds.find(lquery).then(layunovodds => {
                return res.status(200).send({ success: true, results: results, layunovodds: layunovodds });
            });
        }).catch((err) => {

            return res.status(400).send({ success: false, msg: err });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getBookmakerList(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let query = { exodds_cid: req.query.odds_cid, exodds_matchid: req.query.odds_matchid };
        if (req.query.odds_market) {
            query.exodds_market = req.query.odds_market;
        }
        if (req.query.odds_market == 'uogoal') {
            let lquery = { layunov_cid: req.query.odds_cid, layunov_matchid: req.query.odds_matchid };
            BettingLayunovodds.find(lquery).populate('bookmakers').then(results => {
                return res.status(200).send({ success: true, results: results });
            });
        } else {
            BettingExotic.find(query).populate('bookmakers').then(results => {
                return res.status(200).send({ success: true, results: results });
            }).catch((err) => {
                return res.status(400).send({ success: false, msg: err });
            });
        }


    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getBookmakerSelsList(req, res) {

    const token = getToken(req.headers);
    if (token) {
        if (req.query.odds_market == 'uogoal') {
            let lquery = {
                layunov_cid: req.query.odds_cid,
                layunov_matchid: req.query.odds_matchid,
                layunov_bmid: req.query.odds_bm_market
            };
            BettingLayunovodds.find(lquery).then(results => {
                return res.status(200).send({ success: true, results: results });
            });
        } else {
            let query = {
                exodds_cid: req.query.odds_cid,
                exodds_matchid: req.query.odds_matchid,
                exodds_market: req.query.odds_market,
                exodds_bmid: req.query.odds_bm_market,
                exodds_pn: req.query.odds_pn,
            };
            BettingExotic.find(query).then(results => {
                return res.status(200).send({ success: true, results: results });
            }).catch((err) => {
                return res.status(400).send({ success: false, msg: err });
            });
        }
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function createSharbs(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { odds_cid, odds_matchid, odds_market, odds_bm_market,
            odds_pn, odds_sel, odds_bmid, odds_ho, odds_xo, odds_ao
            , odds_ho_old, odds_xo_old, odds_ao_old, odds_tag, odds_tag_color
        } = body;
        if (!odds_cid) return res.status(400).send({ success: false, message: 'Please select league.' });
        if (!odds_matchid) return res.status(400).send({ success: false, message: 'Please select match.' });
        if (!odds_bmid) return res.status(400).send({ success: false, message: 'Please select bookmaker.' });
        if (!odds_ho) return res.status(400).send({ success: false, message: 'Please enter home win odds.' });
        const newSharbs = new BettingSharbsOdds();
        newSharbs.odds_cid = odds_cid;
        newSharbs.odds_matchid = odds_matchid;
        newSharbs.odds_market = odds_market;
        newSharbs.odds_bm_market = odds_bm_market;
        newSharbs.odds_pn = odds_pn;
        newSharbs.odds_sel = odds_sel;
        newSharbs.odds_bmid = odds_bmid;
        newSharbs.odds_ho = odds_ho;
        newSharbs.odds_xo = odds_xo;
        newSharbs.odds_ao = odds_ao;
        newSharbs.odds_ho_old = odds_ho_old;
        newSharbs.odds_xo_old = odds_xo_old;
        newSharbs.odds_ao_old = odds_ao_old;
        newSharbs.odds_tag = odds_tag;
        newSharbs.odds_tag_color = odds_tag_color;
        newSharbs.odds_active = 1;
        newSharbs.save((err) => {
            if (err) {
                return res.status(400).send({ success: true, msg: 'Server error!' });
            }
            return res.status(201).send({ success: true, msg: 'Sharbs created successfully!' });
        });


    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateSharbs(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id, odds_cid, odds_matchid, odds_market, odds_bm_market,
            odds_pn, odds_sel, odds_bmid, odds_ho, odds_xo, odds_ao
            , odds_ho_old, odds_xo_old, odds_ao_old, odds_tag, odds_tag_color } = body;
        if (!odds_cid) return res.status(400).send({ success: false, message: 'Please select league.' });
        if (!odds_matchid) return res.status(400).send({ success: false, message: 'Please select match.' });
        if (!odds_bmid) return res.status(400).send({ success: false, message: 'Please select bookmaker.' });
        if (!odds_ho) return res.status(400).send({ success: false, message: 'Please enter home win odds.' });

        BettingSharbsOdds.findById({
            _id: _id
        }).then(sharbsRow => {
            if (!sharbsRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            let updateData = {};
            updateData.odds_cid = odds_cid;
            updateData.odds_cid = odds_cid;
            updateData.odds_matchid = odds_matchid;
            updateData.odds_market = odds_market;
            updateData.odds_bm_market = odds_bm_market;
            updateData.odds_pn = odds_pn;
            updateData.odds_sel = odds_sel;
            updateData.odds_bmid = odds_bmid;
            updateData.odds_ho = odds_ho;
            updateData.odds_xo = odds_xo;
            updateData.odds_ao = odds_ao;
            updateData.odds_ho_old = odds_ho_old;
            updateData.odds_xo_old = odds_xo_old;
            updateData.odds_ao_old = odds_ao_old;
            updateData.odds_tag = odds_tag;
            updateData.odds_tag_color = odds_tag_color;
            BettingSharbsOdds.findByIdAndUpdate({ _id: sharbsRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Sharbs updated successfully' });
                }).catch(() => {
                    return res.status(500).send({ success: false, msg: 'server error' })
                })

        }).catch(err => {
            if (err.status === 404) res.status(400).send({ success: false, msg: err.msg })
            else return next({ status: 500, msg: 'server error' })
        })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function getSharbsList(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = {};
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }

        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { bm_name: -1 };
        }

        BettingSharbsOdds.find(query).populate('matches')
        .populate('competition').skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                BettingSharbsOdds.countDocuments(query)
                    .then(totalCounts => {
                        return res.status(200).send({ success: true, results: results, totalCount: totalCounts });
                    });
            })
            .catch(() => {
                return res.status(400).send({ success: false, msg: 'Server error' });
            });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
module.exports = {
    createTag,
    updateTags,
    getTags,
    updateTagStatus,
    getTagRowById,
    getAllTags,
    createBookmaker,
    updateBookmakers,
    getBookmakers,
    updateBookmakerStatus,
    getBookmakerRowById,
    getAllLeagus,
    getAllMatches,
    getMarkets,
    getBookmakerList,
    getBookmakerSelsList,
    createSharbs,
    updateSharbs,
    getSharbsList


}

