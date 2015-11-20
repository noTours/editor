
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notours_author` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) DEFAULT NULL,
  `mail` varchar(32) DEFAULT NULL,
  `password` varchar(32) DEFAULT NULL,
  `descripcion` text,
  `type` varchar(32) NOT NULL DEFAULT 'standard',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=847 ;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notours_file` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `object_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `url` varchar(25) DEFAULT NULL,
  `offline` tinyint(1) NOT NULL DEFAULT '0',
  `length` int(11) DEFAULT NULL,
  `type` varchar(10) DEFAULT NULL,
  `volume` tinyint(4) NOT NULL DEFAULT '100',
  `angles` varchar(7) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `object_id` (`object_id`),
  KEY `project_id` (`project_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=18659 ;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notours_object` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `title` text,
  `description` text,
  `type` varchar(10) DEFAULT NULL,
  `level` int(11) NOT NULL DEFAULT '0',
  `milestone` int(11) NOT NULL DEFAULT '0',
  `attributes` text,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `radius` double DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=21471 ;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notours_project` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `author_id` int(11) DEFAULT NULL,
  `title` varchar(32) DEFAULT NULL,
  `description` text,
  `icon` varchar(50) NOT NULL DEFAULT 'logo_notours_screen.png',
  `kml` varchar(50) DEFAULT NULL,
  `latitude` double DEFAULT '0',
  `longitude` double DEFAULT '0',
  `zoom` int(11) DEFAULT '0',
  `levels` int(11) NOT NULL DEFAULT '0',
  `sticky` tinyint(1) NOT NULL DEFAULT '0',
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1679 ;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notours_soundmanager_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notours_soundmanager_relation` (
  `sound_id` int(11) DEFAULT NULL,
  `tag_id` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notours_soundmanager_sound` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) DEFAULT NULL,
  `type` varchar(16) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notours_soundmanager_tag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=13 ;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notours_walker` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) CHARACTER SET utf8 DEFAULT NULL,
  `mac` varchar(32) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=111 ;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notours_walker_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `walker_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=26882 ;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notours_walker_stored` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `walker_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `data` text CHARACTER SET utf8,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1196 ;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notours_walker_trigger` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `walker_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `trigger` int(11) DEFAULT NULL,
  `level` int(11) DEFAULT NULL,
  `time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=10025 ;

-- --------------------------------------------------------
