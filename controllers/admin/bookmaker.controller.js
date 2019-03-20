const Tags = require('../../models/Bookmaker_tags');
const Bookmakers = require('../../models/Bookmaker');
const BettingCompetition = require('../../models/Betting_competition');
const BettingMatches = require('../../models/Betting_matches');
const BettingExotic = require('../../models/Betting_exotic');
const BettingLayunovodds = require('../../models/Betting_layunovodds');
const AdditionalTags = require('../../models/Tags');
const BettingSharbsOdds = require('../../models/Betting_sharbs_odds');
const BettingSharbsDocument = require('../../models/Betting_sharbs_document');
const BettingPlan = require('../../models/Betting_plan');
const Invoice = require('../../models/Invoice');
const UserPlanSubscription = require('../../models/User_plan_subscription');
const chatHistory = require('../../models/Chat');
const EmailTemplates = require('../../models/Email_template');
const User = require('../../models/User');
const AppSubscriptionCase = require('../../models/App_subscription_case');
const { getToken, genRandomPassword, sendCustomMail } = require('../../utils/api.helpers');

var md5 = require('md5');
const path = require('path');
const XLSX = require('xlsx');
const config = require('../../config/config');
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
        newSharbs.odds_ho = isNaN(parseFloat(odds_ho)) ? 0 : parseFloat(odds_ho);
        newSharbs.odds_xo = isNaN(parseFloat(odds_xo)) ? 0 : parseFloat(odds_xo);
        newSharbs.odds_ao = isNaN(parseFloat(odds_ao)) ? 0 : parseFloat(odds_ao);
        newSharbs.odds_ho_old = isNaN(parseFloat(odds_ho_old)) ? 0 : parseFloat(odds_ho_old);
        newSharbs.odds_xo_old = isNaN(parseFloat(odds_xo_old)) ? 0 : parseFloat(odds_xo_old);
        newSharbs.odds_ao_old = isNaN(parseFloat(odds_ao_old)) ? 0 : parseFloat(odds_ao_old);
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
            updateData.odds_matchid = isNaN(parseFloat(odds_matchid)) ? 0 : (odds_matchid);
            updateData.odds_market = isNaN(parseFloat(odds_market)) ? 0 : (odds_market);
            updateData.odds_bm_market = isNaN(parseFloat(odds_bm_market)) ? 0 : (odds_bm_market);
            updateData.odds_pn = odds_pn;
            updateData.odds_sel = odds_sel;
            updateData.odds_bmid = odds_bmid;
            updateData.odds_ho = isNaN(parseFloat(odds_ho)) ? 0 : parseFloat(odds_ho);
            updateData.odds_xo = isNaN(parseFloat(odds_xo)) ? 0 : parseFloat(odds_xo);
            updateData.odds_ao = isNaN(parseFloat(odds_ao)) ? 0 : parseFloat(odds_ao);
            updateData.odds_ho_old = isNaN(parseFloat(odds_ho_old)) ? 0 : parseFloat(odds_ho_old);
            updateData.odds_xo_old = isNaN(parseFloat(odds_xo_old)) ? 0 : parseFloat(odds_xo_old);
            updateData.odds_ao_old = isNaN(parseFloat(odds_ao_old)) ? 0 : parseFloat(odds_ao_old);
            updateData.odds_tag = odds_tag;
            updateData.odds_tag_color = odds_tag_color;
            BettingSharbsOdds.findByIdAndUpdate({ _id: sharbsRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Sharbs updated successfully' });
                }).catch((err) => {
                    return res.status(500).send({ success: false, msg: err })
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
        let query = { odds_active: 1 };
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
            .populate('competition')
            .populate('bookmaker').skip(skippage).limit(pageLimit).sort(sortQ)
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

function getSharbsRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        BettingSharbsOdds.findById(req.query._id).then(tagRow => {
            if (tagRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': tagRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function deleteSharb(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, msg: 'ID missing.' });
        else if (!action) return res.send({ success: false, msg: 'Action missing.' });
        BettingSharbsOdds.findById({ _id }).then(tagRow => {
            if (!tagRow) throw { status: 400, msg: 'Invalid request.' };
            BettingSharbsOdds.findByIdAndRemove({ _id: tagRow._id })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Sharb deleted successfully!' });
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

function uploadSharbsData(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { odds_bmidup, sharbsDocType } = body;
        if (!req.files) {
            return res.status(400).send({ success: false, msg: 'Please select valid file.' });
        } else if (!odds_bmidup) {
            return res.status(400).send({ success: false, msg: 'Please select a bookmaker.' });
        }

        let imageFile = req.files.file;
        let imageName = req.files.file.name;
        let imageExt = imageName.split('.').pop();
        newFileName = md5(genRandomPassword(10) + Date.now()) + '.' + imageExt;
        let filename = path.join(__dirname, '../../uploads/csv/' + newFileName);
        imageFile.mv(filename);

        // BettingSharbsDocument
        const newSharbsDocument = new BettingSharbsDocument();
        newSharbsDocument.sharbsDocName = newFileName;
        newSharbsDocument.sharbsDocBmid = odds_bmidup;
        newSharbsDocument.sharbsDocType = sharbsDocType;
        newSharbsDocument.save((err, doc) => {
            if (err) {
                return res.status(400).send({ success: true, msg: 'Server error!' });
            }
            setTimeout(() => {
                var workbook = XLSX.readFile('./uploads/csv/' + newFileName);
                var sheet_name_list = workbook.SheetNames;
                var worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
                var arrSharbs = [];
                if (worksheet.length > 0) {
                    for (z in worksheet) {
                        var sharbsRow = [];
                        if (worksheet[z]['Event'] && worksheet[z]['Home Odds'] && worksheet[z]['Draw Odds']
                            && worksheet[z]['Away Odds']) {
                            sharbsRow.odds_docid = doc._id;
                            sharbsRow.odds_bmid = parseInt(odds_bmidup);
                            sharbsRow.odds_events = worksheet[z]['Event'];
                            sharbsRow.odds_ho = worksheet[z]['Home Odds'];
                            sharbsRow.odds_xo = worksheet[z]['Draw Odds'];
                            sharbsRow.odds_ao = worksheet[z]['Away Odds'];
                            arrSharbs.push(sharbsRow);
                        }
                    }
                    if (arrSharbs.length > 0) {
                        BettingSharbsOdds.insertMany(arrSharbs).then(() => {
                            let updateData = {};
                            updateData.sharbsDocCount = worksheet.length;
                            BettingSharbsDocument.findByIdAndUpdate({ _id: doc._id }, { $set: updateData })
                                .then(() => {
                                    return res.status(201).send({ success: true, message: 'Uploaded successfully!' });
                                }).catch(() => {
                                    return res.status(500).send({ success: false, msg: 'server error' })
                                });
                        }).catch(() => {
                            return res.status(500).send({ success: false, msg: 'server error' });
                        });
                    } else {
                        return res.status(403).send({ success: false, msg: 'Invalid file!' });
                    }
                }
            }, 100);
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function getBulkSharbsList(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { odds_active: 0 };
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
        BettingSharbsDocument.findOne({ sharbsDocType: req.query.sharbsDocType }).limit(1).sort({ _id: -1 })
            .then(lastDoc => {
                if (!lastDoc) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                if (req.query.editId) {
                    query['odds_docid'] = req.query.editId;
                } else {
                    query['odds_docid'] = lastDoc._id;
                }


                BettingSharbsOdds.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
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
            });

    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateBulkSharbs(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        if (body.length > 0) {
            for (z in body) {
                var id = body[z]['_id'];
                let updateData = {};
                updateData.odds_cid = parseInt(body[z]['odds_cid']);
                updateData.odds_matchid = isNaN(parseFloat(body[z]['odds_matchid'])) ? 0 : (parseInt(body[z]['odds_matchid']));
                updateData.odds_bmid = body[z]['odds_bmid'];
                updateData.odds_events = body[z]['odds_events'];
                updateData.odds_ho = isNaN(parseFloat(body[z]['odds_ho'])) ? 0 : parseFloat(body[z]['odds_ho']);
                updateData.odds_xo = isNaN(parseFloat(body[z]['odds_xo'])) ? 0 : parseFloat(body[z]['odds_xo']);
                updateData.odds_ao = isNaN(parseFloat(body[z]['odds_ao'])) ? 0 : parseFloat(body[z]['odds_ao']);
                updateData.odds_ho_old = isNaN(parseFloat(body[z]['odds_ho_old'])) ? 0 : parseFloat(body[z]['odds_ho_old']);
                updateData.odds_xo_old = isNaN(parseFloat(body[z]['odds_xo_old'])) ? 0 : parseFloat(body[z]['odds_xo_old']);
                updateData.odds_ao_old = isNaN(parseFloat(body[z]['odds_ao_old'])) ? 0 : parseFloat(body[z]['odds_ao_old']);
                updateData.odds_active = 1;
                updateData.hasarb = 1;
                updateData.odds_last_updated = Date.now();

                BettingSharbsOdds.findByIdAndUpdate({ _id: id }, { $set: updateData })
                    .then(() => {

                    }).catch(() => {

                    })
            }
            return res.status(201).send({ success: true, msg: 'Sharbs updated successfully' });
        }
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updateMarketBulkSharbs(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        if (body.length > 0) {
            for (z in body) {
                var id = body[z]['_id'];
                let updateData = {};
                updateData.odds_cid = parseInt(body[z]['odds_cid']);
                updateData.odds_matchid = isNaN(parseFloat(body[z]['odds_matchid'])) ? 0 : (parseInt(body[z]['odds_matchid']));
                updateData.odds_market = body[z]['odds_market'];
                updateData.odds_bm_market = isNaN(parseFloat(body[z]['odds_bm_market'])) ? 0 : (parseInt(body[z]['odds_bm_market']));
                updateData.odds_pn = isNaN(parseFloat(body[z]['odds_pn'])) ? 0 : (parseInt(body[z]['odds_pn']));
                updateData.odds_sel = body[z]['odds_sel'];
                updateData.odds_bmid = body[z]['odds_bmid'];
                updateData.odds_events = body[z]['odds_events'];
                updateData.odds_ho = isNaN(parseFloat(body[z]['odds_ho'])) ? 0 : parseFloat(body[z]['odds_ho']);
                updateData.odds_ho_old = isNaN(parseFloat(body[z]['odds_ho_old'])) ? 0 : parseFloat(body[z]['odds_ho_old']);
                updateData.odds_tag = body[z]['odds_tag'];
                updateData.odds_tag_color = body[z]['odds_tag_color'];
                updateData.odds_active = 1;
                updateData.odds_last_updated = Date.now();
                if (body[z]['odds_market'] == 'uogoal') {
                    let odds_sel_val = (body[z]['odds_sel']).split(' ').pop();
                    updateData.odds_sel_val = odds_sel_val;
                }
                BettingSharbsOdds.findByIdAndUpdate({ _id: id }, { $set: updateData })
                    .then(() => {

                    }).catch((err) => {
                        console.log(err);

                    })
            }
            return res.status(201).send({ success: true, msg: 'Sharbs updated successfully' });
        }
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getBettingSharbsDocument(req, res) {

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
            sortQ = { _id: -1 };
        }

        BettingSharbsDocument.find(query).populate('bookmaker').populate(
            {
                path: 'pendingCount',
                match: { odds_active: 0 }
            }

        ).populate(
            {
                path: 'completedCount',
                match: { odds_active: 1 }
            }

        ).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                BettingSharbsDocument.countDocuments(query)
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
function unloadSharbs(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, msg: 'ID missing.' });
        else if (!action) return res.send({ success: false, msg: 'Action missing.' });
        BettingSharbsDocument.findById({ _id }).then(tagRow => {
            if (!tagRow) throw { status: 400, msg: 'Invalid request.' };
            BettingSharbsDocument.findByIdAndRemove({ _id: tagRow._id })
                .then(() => {
                    BettingSharbsOdds.deleteMany({ odds_docid: tagRow._id })
                        .then(() => {
                            return res.status(201).send({ success: true, msg: 'Sharb deleted successfully!' });
                        });

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

/*** Plans */
function getPlansList(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { plan_deleted: 0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }

        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { _id: -1 };
        }

        BettingPlan.find(query).skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                BettingPlan.countDocuments(query)
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

function createPlan(req, res) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { plan_name, plan_description, plan_price, plan_discount,
            plan_duration, plan_duration_type, plan_features } = body.planData;
        if (!plan_name) return res.status(400).send({ success: false, message: 'Please enter the plan name.' });

        const newPlan = new BettingPlan();
        newPlan.plan_name = plan_name;
        newPlan.plan_description = plan_description;
        newPlan.plan_discount = plan_discount;
        newPlan.plan_price = plan_price;
        newPlan.plan_duration = plan_duration;
        newPlan.plan_duration_type = plan_duration_type;
        newPlan.plan_features = plan_features;

        newPlan.save((err) => {
            if (err) {
                return res.status(400).send({ success: true, msg: err });
            }
            return res.status(201).send({ success: true, msg: 'Plan created successfully!' });
        });


    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getPlanRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        BettingPlan.findById(req.query._id).then(tagRow => {
            if (tagRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': tagRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}

function updatePlan(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id, plan_name, plan_description, plan_price, plan_discount,
            plan_duration, plan_duration_type, plan_features } = body.planData;
        if (!plan_name) return res.status(400).send({ success: false, message: 'Please enter the plan name.' });

        BettingPlan.findById({
            _id: _id
        }).then(sharbsRow => {
            if (!sharbsRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            let updateData = {};

            updateData.plan_name = plan_name;
            updateData.plan_description = plan_description;
            updateData.plan_discount = plan_discount;
            updateData.plan_price = plan_price;
            updateData.plan_duration = plan_duration;
            updateData.plan_duration_type = plan_duration_type;
            updateData.plan_features = plan_features;
            BettingPlan.findByIdAndUpdate({ _id: sharbsRow._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Plan updated successfully' });
                }).catch((err) => {
                    return res.status(500).send({ success: false, msg: err })
                })

        }).catch(err => {
            if (err.status === 404) res.status(400).send({ success: false, msg: err.msg })
            else return next({ status: 500, msg: 'server error' })
        })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function updatePlanStatus(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        BettingPlan.findById({ _id }).then(user => {
            if (!user) throw { status: 400, msg: 'Invalid request.' };
            let updateData = {};
            if (action == 'delete')
                updateData.plan_deleted = true;


            BettingPlan.findByIdAndUpdate({ _id: user._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Plan updated successfully!' });
                }).catch(() => {
                    return res.status(400).send({ success: false, msg: 'Server error' });
                });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}


function getPaymentList(req, res) {

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
            sortQ = { _id: -1 };
        }

        Invoice.find(query).populate('invoice_user_id').skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                Invoice.countDocuments(query)
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

function getUserPlansList(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { plan_deleted: 0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }

        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { _id: -1 };
        }

        UserPlanSubscription.find(query).populate('user_id').populate('plan_id').skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                UserPlanSubscription.countDocuments(query)
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
function getChatList(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let pageLimit = parseInt(req.query.pageLimit);

        let skippage = pageLimit * (req.query.page - 1);
        let query = { deleted_on: 0 };
        let sortQ = {};
        if (req.query.searchKey && req.query.searchBy) {
            query[req.query.searchBy] = new RegExp(req.query.searchKey, 'i');
        }

        if (req.query.sortOrder && req.query.sortKey) {
            let sortOrder = (req.query.sortOrder == 'asc') ? 1 : -1;
            sortQ[req.query.sortKey] = sortOrder;
        } else {
            sortQ = { _id: -1 };
        }

        chatHistory.find(query).populate('user_id').skip(skippage).limit(pageLimit).sort(sortQ)
            .then(results => {
                if (results.length === 0) return res.status(200).send({ success: false, 'results': [], totalCount: 0, });
                chatHistory.countDocuments(query)
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
function updateChatStatus(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        chatHistory.findById({ _id }).then(user => {
            if (!user) throw { status: 400, msg: 'Invalid request.' };
            let updateData = {};
            if (action == 'delete')
                updateData.deleted_on = 1;


            chatHistory.findByIdAndUpdate({ _id: user._id }, { $set: updateData })
                .then(() => {
                    return res.status(201).send({ success: true, msg: 'Chat deleted successfully!' });
                }).catch(() => {
                    return res.status(400).send({ success: false, msg: 'Server error' });
                });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function updateUserPlanStatus(req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        const { body } = req;
        const { _id, action } = body;
        if (!_id) return res.send({ success: false, message: 'ID missing.' });
        else if (!action) return res.send({ success: false, message: 'Action missing.' });
        UserPlanSubscription.findById({ _id }).populate('user_id').populate('plan_id').then(planRow => {
            if (!planRow) throw { status: 400, msg: 'Invalid request.' };

            let updateData = {};
            if (action == 'delete') {
                updateData.plan_deleted = true;
                UserPlanSubscription.findByIdAndUpdate({ _id: planRow._id }, { $set: updateData })
                    .then(() => {
                        return res.status(201).send({ success: true, msg: 'Plan deleted successfully!' });
                    }).catch(() => {
                        return res.status(400).send({ success: false, msg: 'Server error' });
                    });
            } else if (action == 'decline') {
                updateData.payment_status = 2;
                UserPlanSubscription.findByIdAndUpdate({ _id: planRow._id }, { $set: updateData })
                    .then(() => {
                        let userUpdateData = {};
                        userUpdateData.paymentStatus = 0;
                        User.findByIdAndUpdate({ _id: planRow.user_id._id }, { $set: userUpdateData })
                            .then(() => {
                                EmailTemplates.findOne({ template_name: 'subscription_cancelllation' })
                                    .then(emailRow => {
                                        var subject = emailRow.template_subject;
                                        var htmlStr = emailRow.template_content;
                                        var subjectHtml = subject;
                                        var resultHtml = htmlStr.replace(/{USER_NAME}/g, planRow.user_id.username);
                                        resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                                        resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                                        resultHtml = resultHtml.replace(/{PLAN_NAME}/g, planRow.plan_name);
                                        var toEmail = planRow.user_id.email;
                                        sendCustomMail(planRow.user_id.username, toEmail, resultHtml, subjectHtml);
                                        return res.status(201).send({ success: true, msg: 'Plan declined successfully!' });
                                    }).catch(err => {

                                        return res.json({ success: false, msg: err })
                                    })
                            }).catch((err) => {

                                return res.status(400).send({ success: false, msg: err });
                            });
                    }).catch((err) => {

                        return res.status(400).send({ success: false, msg: err });
                    });


            } else if (action == 'approve') {
                updateData.payment_status = 1;
                UserPlanSubscription.findByIdAndUpdate({ _id: planRow._id }, { $set: updateData })
                    .then(() => {
                        let userUpdateData = {};
                        userUpdateData.paymentStatus = 1;
                        userUpdateData.planId = planRow._id;
                        User.findByIdAndUpdate({ _id: planRow.user_id._id }, { $set: userUpdateData })
                            .then(() => {
                                EmailTemplates.findOne({ template_name: 'subscription_approved' })
                                    .then(emailRow => {
                                        var subject = emailRow.template_subject;
                                        var htmlStr = emailRow.template_content;
                                        var subjectHtml = subject;
                                        var resultHtml = htmlStr.replace(/{USER_NAME}/g, planRow.user_id.username);
                                        resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                                        resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                                        resultHtml = resultHtml.replace(/{PLAN_NAME}/g, planRow.plan_name);
                                        resultHtml = resultHtml.replace(/{Plan Price}/g, planRow.plan_price);
                                        resultHtml = resultHtml.replace(/{Plan Description}/g, planRow.plan_description);
                                        resultHtml = resultHtml.replace(/{Payment method}/g, planRow.plan_paymentmethod);
                                        var toEmail = planRow.user_id.email;
                                        sendCustomMail(planRow.user_id.username, toEmail, resultHtml, subjectHtml);
                                        if (planRow.user_id && planRow.user_id.referrdapp_by) {
                                            var _id = planRow.user_id.referrdapp_by;
                                            User.findById({ _id }).then(ruser => {
                                                if (ruser) {
                                                    var amount = Math.round((20 / 100) * planRow.plan_price);
                                                    const newSubscriptionCase = new AppSubscriptionCase();
                                                    newSubscriptionCase.userid = planRow.user_id._id;
                                                    newSubscriptionCase.refid = planRow.user_id.referrdapp_by;
                                                    newSubscriptionCase.amount = amount;
                                                    newSubscriptionCase.status = "Confirm";
                                                    newSubscriptionCase.save((err) => {
                                                        if (err) {
                                                            return res.status(400).send({ success: true, msg: 'Server error!' });
                                                        }
                                                        EmailTemplates.findOne({ template_name: 'app_sub_raf_bouns' })
                                                            .then(emailRow => {
                                                                var dateJoined = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                                                                var subject = emailRow.template_subject;
                                                                var htmlStr = emailRow.template_content;
                                                                var subjectHtml = subject;
                                                                var resultHtml = htmlStr.replace(/{USER_NAME}/g, ruser.username);
                                                                resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                                                                resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                                                                resultHtml = resultHtml.replace(/{DATE_JOINED}/g, dateJoined);
                                                                resultHtml = resultHtml.replace(/{CLAIM_CONFIRMED}/g, dateJoined);
                                                                resultHtml = resultHtml.replace(/{AMOUNT}/g, amount);
                                                                var toEmail = ruser.email;
                                                                sendCustomMail(ruser.username, toEmail, resultHtml, subjectHtml);
                                                                return res.status(201).send({ success: true, msg: 'Plan approved successfully!' });
                                                            });
                                                    });
                                                }
                                            });

                                        } else {
                                            return res.status(201).send({ success: true, msg: 'Plan approved successfully!' });
                                        }
                                    }).catch(err => {
                                        console.log(err);
                                        return res.json({ success: false, msg: err })
                                    })
                            }).catch((err) => {
                                console.log(err);
                                return res.status(400).send({ success: false, msg: err });
                            });
                    }).catch((err) => {
                        console.log(err);
                        return res.status(400).send({ success: false, msg: err });
                    });

            }
        }).catch((err) => {
            console.log(err);
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getUserPlanRowById(req, res) {
    const token = getToken(req.headers);
    if (token) {
        UserPlanSubscription.findById(req.query._id).populate('user_id').then(tagRow => {
            if (tagRow.length === 0) return res.status(200).send({ success: false });
            return res.status(200).send({ success: true, 'results': tagRow });
        }).catch(() => {
            return res.status(400).send({ success: false, msg: 'Server error' });
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorised' });
    }
}
function getAllPlans(req, res) {

    const token = getToken(req.headers);
    if (token) {
        let query = { plan_deleted: 0 };
        let sortQ = {};
        sortQ = { name: 1 };
        BettingPlan.find(query).sort(sortQ)
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
function updateUserPlan(req, res, next) {
    const token = getToken(req.headers);
    if (token) {

        const { body } = req;
        const { _id, plan_id, plan_paymentmethod, subscribed_on, expired_on } = body;
        // console.log(body);
        // return;
        if (!plan_id) return res.status(400).send({ success: false, message: 'Please select a plan.' });

        UserPlanSubscription.findById({
            _id: _id
        }).then(uPlanRow => {
            if (!uPlanRow) return res.status(401).send({ success: false, message: 'Invalid request.' });
            BettingPlan.findById({
                _id: plan_id
            }).then(planRow => {
                if (planRow.length > 0) return res.status(400).send({ success: false, msg: 'Invalid request.' });
                let updateData = {};
                updateData.plan_id = planRow._id;
                updateData.plan_name = planRow.plan_name;
                updateData.plan_price = planRow.plan_price;
                updateData.plan_description = planRow.plan_description;
                updateData.plan_duration = planRow.plan_duration;
                updateData.plan_duration_type = planRow.plan_duration_type;
                updateData.plan_paymentmethod = plan_paymentmethod;
                updateData.subscribed_on = subscribed_on;
                updateData.payment_pending_email = 0;
                updateData.plan_expire_email = 0;
                updateData.expired_on = expired_on;


                UserPlanSubscription.findByIdAndUpdate({ _id: uPlanRow._id }, { $set: updateData })
                    .then(() => {
                        return res.status(201).send({ success: true, msg: 'Plan updated successfully' });
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
    getSharbsList,
    getSharbsRowById,
    deleteSharb,
    uploadSharbsData,
    getBulkSharbsList,
    updateBulkSharbs,
    updateMarketBulkSharbs,
    getBettingSharbsDocument,
    unloadSharbs,
    getPlansList,
    createPlan,
    getPlanRowById,
    updatePlan,
    updatePlanStatus,
    getPaymentList,
    getUserPlansList,
    getChatList,
    updateChatStatus,
    updateUserPlanStatus,
    getUserPlanRowById,
    getAllPlans,
    updateUserPlan,


}

