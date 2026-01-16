import { useState, useMemo, useEffect } from 'react';
import { useExporters, ExporterInput, Exporter } from '@/hooks/useExporters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  Package,
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
  X,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

// Initial exporters data for seeding
const INITIAL_EXPORTERS_DATA: ExporterInput[] = [
  { sl_no: 1, name: "Aabote Fashion LLP", hall_no: "2A", stall_no: "T-12", address: "G-1-158, Industrial Area Apparel Park, Jagatpura Jaipur-302025", state: "Rajasthan", contact_person: "Arpit Jain", mobile_number: "95097 07990", landline_number: "", email: "aabotefashionllp@gmail.com", website: "www.aabotefashionllp.com", products_on_display: "Beach Wear,Trousers, Shorts, Skirts, Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts, Tunics,Boys Wear, Girls Wear", export_markets: "" },
  { sl_no: 2, name: "Tushar Handworks", hall_no: "2C", stall_no: "F-07", address: "P-7A Tilak Marg, C-Scheme, Jaipur-302001", state: "Rajasthan", contact_person: "Tushar Bhatnagar", mobile_number: "98290 60717", landline_number: "0141-404-8625", email: "mail@tushargroup.com", website: "www.tusharhandworks.com", products_on_display: "Jeans/ Denims, Women Blouses, Women Dresses, Knitwear, Designer Labels-Fashion", export_markets: "Japan, France, Spain, Italy, Norway, USA, Australia, Chile, Uruguay, Egypt, Dubai" },
  { sl_no: 3, name: "Uptodate Impex Private Limited", hall_no: "2C", stall_no: "G-05", address: "1898/18, GF, Govindpuri Extension Delhi-110019", state: "Uttar Pradesh", contact_person: "Aasim Ali Nadvi", mobile_number: "98735 64041", landline_number: "", email: "aasim.uptodate@gmail.com", website: "www.uptodateimpex.in", products_on_display: "Casual Wear: Dress, Trousers, Skirts, Top, Sleep Wear &Payjamas", export_markets: "USA, Spain, Japan" },
  { sl_no: 4, name: "DKK Exports", hall_no: "2C", stall_no: "G-03", address: "43, Zaver Mansion, 5th Floor Chowpatty Sea Face, Mumbai-400007", state: "Maharashtra", contact_person: "Ruchit Kapadia", mobile_number: "99205 68234", landline_number: "022-247-02821", email: "dkk@dkkexports.com", website: "", products_on_display: "Men 's Shirt, Boys Wear, Shorts, Co-ordinates", export_markets: "Israel, Russia, UK, NewzeaLand, Mexico" },
  { sl_no: 5, name: "Triveni Exports", hall_no: "2C", stall_no: "C-13", address: "17-A Narvarpuri Colony Badanpura, Jaipur-302002", state: "Rajasthan", contact_person: "Ashok Sharma", mobile_number: "98281 05510", landline_number: "", email: "triveni0141@yahoo.co.in", website: "", products_on_display: "Skirts,Men 's Shirts,Women Dresses,Women 's Skirts,Curtains", export_markets: "Japan" },
  { sl_no: 6, name: "Lotus Exim", hall_no: "2C", stall_no: "D-15", address: "Katodara, Bardoli Highway, Bagumara, Surat-394305", state: "Gujarat", contact_person: "Mohit Tewani", mobile_number: "90990 95451", landline_number: "", email: "lotuseximsrt@gmail.com", website: "lotuseximsrt@gmail.com", products_on_display: "Beach Wear,Trousers,Skirts,Women Dresses,Jackets,Home Wear &Lounge Wear", export_markets: "" },
  { sl_no: 7, name: "Only For U Designs Pvt Ltd", hall_no: "2C", stall_no: "F-01", address: "104, Amir Industrial Estate Sunmill Compound, Lower Parel (West) Mumbai-400013", state: "Maharashtra", contact_person: "Akshat Bubna", mobile_number: "98202 17194", landline_number: "022-6140-5402/03", email: "akshat@ofudesigns.com", website: "www.ofudesigns.com", products_on_display: "Beach Wear,Women 's Blouses,Women Dresses, Women Skirts,Silk Garments,Knitwear,Tunics,Jackets", export_markets: "USA, Europe, Middle East, Australia, Far East, Dubai" },
  { sl_no: 8, name: "Shalimar Overseas", hall_no: "2A", stall_no: "T-11", address: "C-80 Sports &Surgical Complex Jalandhar-144001", state: "Punjab", contact_person: "Anshu Maggu", mobile_number: "98105 77889", landline_number: "0181-505-7889", email: "anshumaggu@yahoo.com", website: "", products_on_display: "Shorts,Skirts,Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts,Knitwears,Tunics,", export_markets: "USA, South America, Spain, Australia" },
  { sl_no: 9, name: "Pushkar Art Gallery", hall_no: "2C", stall_no: "B-03", address: "Vinayak Nagar, Near Police Station Pushkar-305022", state: "Rajasthan", contact_person: "Arpit Nahar", mobile_number: "90796 42057", landline_number: "", email: "pushkarartgallery@gmail.com", website: "NA", products_on_display: "Handloom Cotton Bags &Pouches", export_markets: "Europe, USA" },
  { sl_no: 10, name: "Ma 'am Arts", hall_no: "2C", stall_no: "B-13", address: "G-51, Sitapura Industrial Area, Jaipur-302022", state: "Rajasthan", contact_person: "Jigar Dewan", mobile_number: "98293 52052", landline_number: "", email: "jigar.dewan@maamarts.com", website: "www.maamarts.com", products_on_display: "Beach Wear,Trousers,Shorts,Skirts,Women DressesWomen 's Trousers,Women 's Skirts, Private Labels- Fashion", export_markets: "USA, Japan, UAE, Europe" },
  { sl_no: 11, name: "Shiraj Exports", hall_no: "2B", stall_no: "K-12", address: "F-23 D, Malviya Industrial Area Jaipur-302017", state: "Rajasthan", contact_person: "Shiraj Kumar, Sameen Kumar", mobile_number: "98293 88988, 98297 88288", landline_number: "0141-402-6053/54", email: "shiraz@shirajexports.com", website: "", products_on_display: "High Fashion Ladies Wear", export_markets: "France, Germany, Italy, U.K., Spain, Portugal, USA, Canada, Brazil, Japan, Hongkong, Australia" },
  { sl_no: 12, name: "Panna Textile Industries Private Limited", hall_no: "2B", stall_no: "J-06", address: "Gala No. 1, 2, 2-A &3, Third Floor, J- Wing, Tex Center, Chandivali, Andheri ( East) , Mumbai-400072", state: "Maharashtra", contact_person: "Umang Poddar", mobile_number: "98702 01561", landline_number: "", email: "umang@pannatex.com", website: "www.pannatex.com", products_on_display: "Beach Wear,Men 's Shirts,Women 's Blouses,Boys 'Wear,Girls Wear", export_markets: "Spain, Portugal, Columbia, Poland, U.K., South Africa, Panama" },
  { sl_no: 13, name: "Smash Creations", hall_no: "2A", stall_no: "R-07", address: "D-33, Sector -37, Noida-201301", state: "Uttar Pradesh", contact_person: "Saamarth Khanna", mobile_number: "98102 86837", landline_number: "", email: "sanjay.khanna032@gmail.com", website: "NA", products_on_display: "Women Dresses, Trousers, Shorts, Skirts &Jackets", export_markets: "" },
  { sl_no: 14, name: "Nyraa Arts Private Limited", hall_no: "2B", stall_no: "K-01", address: "F-17A, RIICO, Malviya Nagar Industrial Area Jaipur-302017", state: "Rajasthan", contact_person: "Shreya Ajesh", mobile_number: "96360 30322", landline_number: "", email: "shrreya@nyraaarts.com", website: "www.nyraaarts.com", products_on_display: "Beach Wear,Trousers,Shorts,Skirts,Co-ordinatesMen 's Shirts,Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts,TunicsSilk Garments, Private labels &Designer Labels", export_markets: "Europe, Australia, South Africa" },
  { sl_no: 16, name: "Churchit Exports", hall_no: "2C", stall_no: "B-21", address: "C4 Sector-85 Noida-201301", state: "Uttar Pradesh", contact_person: "Charchit Sadh", mobile_number: "98102 74605", landline_number: "", email: "churchitexports@cmails.in", website: "", products_on_display: "Ladies Wear Fashion Accessories, Jeans, Denims, Trousers, Shorts, Skirts, Women Blouses, Women Dresses, Women Trousers, Women skirts, Suits, Tunics, Jackets", export_markets: "Europe" },
  { sl_no: 17, name: "R K AND COMPANY", hall_no: "2B", stall_no: "I-10", address: "B-82, Sector-83 Phase-2, Noida-201301", state: "Uttar Pradesh", contact_person: "Ram Krishan Tandon", mobile_number: "98101 72155", landline_number: "011-252-26775", email: "rk@rkncompany.in", website: "www.rkncompany.in", products_on_display: "Women Beach Wear Fabric Hand Bag", export_markets: "USA, Europe, UK, Japan" },
  { sl_no: 18, name: "Swati Exim Private Limited", hall_no: "2C", stall_no: "B-20", address: "A-21, Sector-64, Noida-201301", state: "Uttar Pradesh", contact_person: "Shashi Nangia", mobile_number: "98111 57676", landline_number: "", email: "md@swatiexim.net", website: "www.swatiexim.net", products_on_display: "Women 's Blouses,Women Dresses,Women 's Trousers,Tunics,Girls Wear,Sleep Wear &pyjamas", export_markets: "USA,UK,Denmark Belgium, Australia, Newzealand" },
  { sl_no: 19, name: "Mint Impex", hall_no: "2B", stall_no: "H-09", address: "A-92, Sector-65 Noida-201301", state: "Uttar Pradesh", contact_person: "S K Singhal", mobile_number: "98970 41421", landline_number: "0591-297-1625", email: "samir@mintimpex.com", website: "www.mintimpex.com", products_on_display: "Women 's Blouses,Women Dresses,Girls Wear,Home Wear &Lounge Wear,Sleep Wear &pyjamas", export_markets: "France, Belgium, Portugal, Russia, USA" },
  { sl_no: 20, name: "Kichwamaji Exporters", hall_no: "2B", stall_no: "L-05", address: "E-174, Shastri Nagar, Delhi-110052", state: "Delhi", contact_person: "Satish Kumar Thukral", mobile_number: "88267 07770, 76785 88336", landline_number: "011-236-44544/545", email: "satish@kichwamaji.in", website: "", products_on_display: "Blouses, Skirts, Pants, Dresses for Women", export_markets: "USA, Europe, South America, Korea" },
  { sl_no: 21, name: "Rahul Textiles and Handicraft", hall_no: "2C", stall_no: "D-11", address: "First Street Right Hand, Gangapole Amer Road, Jaipur-302019", state: "Rajasthan", contact_person: "Rahul Khandaka", mobile_number: "98290 32865", landline_number: "", email: "rth32865@gmail.com", website: "rahultextilesandhandicraft.com", products_on_display: "Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts", export_markets: "USA, UK, Australia" },
  { sl_no: 22, name: "Shilpayan Exports", hall_no: "2B", stall_no: "M-06", address: "1H/365, Indira Gandhi Nagar Jaipur-302017", state: "Rajasthan", contact_person: "Dinesh Singh Chauhan", mobile_number: "78774 14719", landline_number: "", email: "dinesh@shilpayanexports.in", website: "www.shilpayanexports.in", products_on_display: "Beach Wear,Shorts,Skirts,Women 's Blouses,Women Dresses,Women 's Trousers,Silk Garments,Tunics,Jackets", export_markets: "Europe, Australia, South America, UAE, Turkey" },
  { sl_no: 23, name: "Somendra Textiles", hall_no: "2C", stall_no: "C-05", address: "39 Mathur Vaish Nagar, Tonk Road, Near Hotel The Theme, Jaipur-302029", state: "Rajasthan", contact_person: "Somendra Gupta", mobile_number: "98280 75072", landline_number: "", email: "info@somendratextiles.com", website: "", products_on_display: "", export_markets: "" },
  { sl_no: 24, name: "Sardar Silk House", hall_no: "2C", stall_no: "E-01", address: "469, Chandani Chowk, Delhi-110006", state: "Delhi", contact_person: "I.S.Kohli", mobile_number: "98110 35550", landline_number: "", email: "sardarindia@gmail.com", website: "", products_on_display: "Ladies Garments, Scarfs, Shawls,Trousers,Shorts,Skirts,Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts,Silk Garments,Tunics,Jackets", export_markets: "Europe, USA, UK, Japan" },
  { sl_no: 25, name: "Jay Enterprise", hall_no: "2B", stall_no: "L-17", address: "572-574, Adarsh Market-2, Ring Road Surat-395002", state: "Gujarat", contact_person: "Jay Rakesh Nahata", mobile_number: "88791 59177", landline_number: "", email: "jishakaftan@gmail.com", website: "www.jishakaftan.com; www.jishkaftan.in", products_on_display: "Beach Wear, Skirts, Co-ordinates, Kaftan, Blouses, Dress, Private Labels Fashion", export_markets: "Barbados," },
  { sl_no: 26, name: "Savana International", hall_no: "2B", stall_no: "L-16", address: "T-8, Okhla Industrial Area, Phase-2 Delhi-110020", state: "Delhi", contact_person: "Sandeep Chhabra", mobile_number: "98100 59894", landline_number: "", email: "savana@savanainternational.com", website: "", products_on_display: "", export_markets: "" },
  { sl_no: 27, name: "High Fashion", hall_no: "2B", stall_no: "J-07", address: "F-832, Third Phase RICCO Industrial Area, Sitapura, Jaipur-302022", state: "Rajasthan", contact_person: "Pradeep Kumar Khyani", mobile_number: "98284 67618", landline_number: "", email: "parasioimpex@gmail.com", website: "", products_on_display: "Beach Wear,Trousers,Shorts,Skirts,Women Dresses,Women 's Trousers,Women 's Skirts,Silk Garments,Tunics,Jackets", export_markets: "Italy, Spain, Argentina, Japan" },
  { sl_no: 28, name: "K K Global Exports", hall_no: "2C", stall_no: "C-15", address: "C-5, Sector-63 Noida-201301", state: "Uttar Pradesh", contact_person: "Aditya Sadh", mobile_number: "99998 89903", landline_number: "", email: "info@kkglobalexports.com", website: "www.kkglobalexports.com", products_on_display: "Beach Wear,Skirts,Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts", export_markets: "Europe, USA, Middle East" },
  { sl_no: 29, name: "Kariwala Industries Limited", hall_no: "2C", stall_no: "G-02", address: "Kariwala Towers, J1-5, Block-EP, Salt Lake Sector-V, Kolkata-700091", state: "West Bengal", contact_person: "Anand Sureka", mobile_number: "98300 10341", landline_number: "", email: "anand@kariwala.com", website: "www.kariwala.com", products_on_display: "Trousers,Shorts,Men 's Shirts,Mens Vest,Jackets", export_markets: "Europe, UK, USA" },
  { sl_no: 30, name: "SAR Apparels India Private Limited", hall_no: "2C", stall_no: "E-04", address: "Badu Road, Madhyagram, Kirtipur, Barasat-I, North 24 Paragnas-700128", state: "West Bengal", contact_person: "Niket Jain", mobile_number: "98741 73373", landline_number: "", email: "niket@sarapparels.com", website: "www.sarapparels.com", products_on_display: "", export_markets: "Saudi Arab, Dubai" },
  { sl_no: 31, name: "S K India International", hall_no: "2B", stall_no: "N-10", address: "G-1/148-149, EPIP Garment Zone, Sitapura , Jaipur-302022", state: "Rajasthan", contact_person: "Manish Kumar Sogani", mobile_number: "98290 13988", landline_number: "", email: "skindiaintl@datainfosys.net", website: "", products_on_display: "Dress, Blouse, Trouser Shorts", export_markets: "Uruguay, South America, Europe" },
  { sl_no: 32, name: "VT Exports Private Limited", hall_no: "2C", stall_no: "E-03", address: "24, Netaji Subhas Road, Kolkata-700001", state: "West Bengal", contact_person: "Ajay Tantia", mobile_number: "98312 09903", landline_number: "", email: "info@vtexports.com", website: "", products_on_display: "", export_markets: "USA, UK, South Africa, Saudi Arabia, UAE, Japan" },
  { sl_no: 34, name: "Bhavya International", hall_no: "2B", stall_no: "M-01", address: "F-207, EPIP, Sitapura Industrial Area, Jaipur-302022", state: "Rajasthan", contact_person: "Jay Kumar Maheshwari", mobile_number: "94140 42094", landline_number: "", email: "jk@bhavyainternational.in", website: "www.bhavyainternational.in", products_on_display: "Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts,,Tunics,Jackets,Silk Garments", export_markets: "Japan, USA, Europe, UK, Germany" },
  { sl_no: 35, name: "Ritesh International", hall_no: "2B", stall_no: "L-07", address: "D-5, Hosiery Complex Phase-2 Noida-201301", state: "Uttar Pradesh", contact_person: "Ritesh Kumar Sadh", mobile_number: "98111 16874", landline_number: "", email: "info@riteshinternational.in", website: "www.riteshinternational.in", products_on_display: "", export_markets: "Italy Spain, France" },
  { sl_no: 36, name: "Sopra International", hall_no: "2B", stall_no: "J-10", address: "H1-39 &46, RIICO Industrial Area Mansarovar, Jaipur-302020", state: "Rajasthan", contact_person: "Jatin Sopra", mobile_number: "99280 77025", landline_number: "", email: "sopra@soprainternational.com", website: "", products_on_display: "Jeans/ Denim,Shorts,Skirts,Co-ordinates,Women 's Blouses,Women Dresses,Women 's Trousers,Tunics,Night/ Lounge Wear", export_markets: "Europe, South America" },
  { sl_no: 37, name: "Lux Industries Limited (Cozy)", hall_no: "2B", stall_no: "H-08", address: "17th Floor, North Wing, Adventz Infinity, BN-5 Salt Lake City, Sector V, Kolkata-700091", state: "West Bengal", contact_person: "Vinay Maheshwari", mobile_number: "98302 67735", landline_number: "#ERROR!", email: "vinay.maheshwari@luxinnerwear.com", website: "www.luxinnerwear.com", products_on_display: "Tshits/ Polo Shirts, Brief, Hosiery, Socks, Men 's Underwear &Boxer Shorts", export_markets: "Middle East, South East Asia, Africa" },
  { sl_no: 38, name: "Stylish Creation", hall_no: "2C", stall_no: "C-03", address: "F-123, Vikaspuri, New Delhi-110018", state: "Delhi", contact_person: "Supriya Hora", mobile_number: "98183 05168", landline_number: "", email: "supriya.stylishcreation@gmail.com", website: "", products_on_display: "Beach Wear, Women 's Blouses, Women Dresses, Knitwear, Tunics", export_markets: "USA, Mexico, France, Portugal" },
  { sl_no: 39, name: "Aan Apparels and Accessories", hall_no: "2B", stall_no: "N-04", address: "J-63 Surajpur Industrial Area, Site-V, Kasna, Greater Noida", state: "Uttar Pradesh", contact_person: "Manik Sadh", mobile_number: "98113 55057", landline_number: "011-410-95776", email: "info@aan.net.in; deepti@aan.net.in", website: "", products_on_display: "", export_markets: "Europe" },
  { sl_no: 40, name: "K S Beautiful Art and Craft", hall_no: "2B", stall_no: "N-09", address: "GC-99, Pul Pehladpura, Samadhi wali Gali, Delhi-110044", state: "Delhi", contact_person: "Mohd Salman", mobile_number: "88829 87332", landline_number: "", email: "ksoverseas99@gmail.com", website: "www.delhiswimwearfactory.com", products_on_display: "Women Swimwear,Handmade Bikinis,Surfing Swimwear,Viscose Kaftan,Kimonos,BeachwearWomen Beach Dress,Rashguards,Kids Swim,Mens Shorts,Private Label Fashion &Designer Labels", export_markets: "UK, Spain, France, Italy, Australia, Newzealand, Dubai, USA" },
  { sl_no: 43, name: "P.K. Overseas Merchandising Pvt Ltd", hall_no: "2A", stall_no: "S-02", address: "E-36, First Floor, Naraina Vihar, New Delhi-110028", state: "Delhi", contact_person: "Vandana Gambhir", mobile_number: "98104 30494", landline_number: "011-425-03043", email: "vandy.gambhir@pkoverseas.in", website: "", products_on_display: "T-Shirts,Women 's Blouses,Women Dresses,Knitwears,Tunics", export_markets: "Israel, Canada, UAE, Japan" },
  { sl_no: 44, name: "Shailendar Traders", hall_no: "2B", stall_no: "M-07", address: "B-318, Morya House Off Andheri Link Road Andheri West, Mumbai-400053", state: "Maharashtra", contact_person: "Shailendar Chhugani", mobile_number: "98203 27722", landline_number: "", email: "info@shailendarchhugani.com", website: "www.shailendarchhugani.com", products_on_display: "Beach Wear,Co-ordinates,Women 's Blouses,Women Dresses,Tunics,Jalabias and Kaftans", export_markets: "Saudi Arabia, UAE, Oman" },
  { sl_no: 45, name: "Rishub Fashion", hall_no: "2B", stall_no: "N-14", address: "442/20 Manohar Nagar Hardoi Road, Lucknow-226003", state: "Uttar Pradesh", contact_person: "Rishab Tandon", mobile_number: "97954 26637", landline_number: "", email: "rishubt@gmail.com", website: "", products_on_display: "Beach Wear,Skirts,Women 's Blouses,Women Dresses,Tunics", export_markets: "Spain, Portugal, Uruguay" },
  { sl_no: 46, name: "Myie", hall_no: "2C", stall_no: "F-04", address: "307 Keshavam Square, B/h City Pulse, Kudasan, GandhiNagar-382421", state: "Gujarat", contact_person: "Mohit Bajpai", mobile_number: "93760 16777", landline_number: "", email: "ecommoshi@gmail.com", website: "www.moshi.co.in", products_on_display: "T-Shirts / Polos,Men 's Shirts,Women Dresses,KnitwearsBoys 'Wear", export_markets: "" },
  { sl_no: 47, name: "Bhana Vogue Gallery", hall_no: "2A", stall_no: "S-03", address: "1/53, Kanakpura, RIICO Industrial Area, Sirsi Road, Jaipur-302034", state: "Rajasthan", contact_person: "Bhawana Sharma", mobile_number: "98284 01768", landline_number: "", email: "bhanavogue@yahoo.com", website: "", products_on_display: "Beach Wear,Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts,Tunics,Jackets,Girls Wear", export_markets: "Argentina, Uruguay, Portugal, Greece, UK, Japan, Middle East" },
  { sl_no: 48, name: "Grace Fashion Accessories", hall_no: "2B", stall_no: "N-03", address: "Industrial Unit No. 196, Udyog Vihar Phase-4, Gurgaon-122015", state: "Haryana", contact_person: "Sachin Kapoor", mobile_number: "98100 01179", landline_number: "0124-423-0875", email: "sacchin@gracefashionaccessories.com", website: "www.gracefashionaccessories.com", products_on_display: "imitation jewellery &Accessories", export_markets: "USA, Europe" },
  { sl_no: 49, name: "Bluestar Advertisers", hall_no: "2C", stall_no: "F-10", address: "B-56A, Sector-7, Noida-201301", state: "Uttar Pradesh", contact_person: "Ankit Maheshwari", mobile_number: "99992 87606", landline_number: "", email: "ops@leatherplusbelts.com", website: "www.leatherplus.in", products_on_display: "Leather Belts/ Wallets/Bags and Accessories", export_markets: "Middle East, France, Mexico" },
  { sl_no: 50, name: "Kamlavati Exports", hall_no: "2A", stall_no: "O-03", address: "16-B, Udyog Vihar, Surajpur, Greater Noida-201305", state: "Uttar Pradesh", contact_person: "Shikhar Sadh", mobile_number: "99100 03011", landline_number: "", email: "exports@kamlavati.com", website: "", products_on_display: "", export_markets: "Italy, Spain, France, UAE" },
  { sl_no: 51, name: "P C Jain Textile Private Limited", hall_no: "2B", stall_no: "N-02", address: "Plot # 31, Sector-6, IMT Manesar, Gurgaon-122052", state: "Haryana", contact_person: "Ashok Kumar Jain", mobile_number: "93507 69002", landline_number: "", email: "office@pcjsgroup.com", website: "", products_on_display: "Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts,Men 's Shirts", export_markets: "" },
  { sl_no: 52, name: "Bhandari Hosiery Exports Limited", hall_no: "2C", stall_no: "G-04", address: "Bhandari House, Rahon Road, Village-Meharban, Ludhiana-141007", state: "Punjab", contact_person: "Nitin Bhandari", mobile_number: "88720 16401", landline_number: "", email: "nitin@bhandariexport.com", website: "", products_on_display: "Shorts,T-Shirts / Polos,Boys 'Wear,Girls Wear,Sports Wear,Track Suits,Outerwear", export_markets: "France, Hungary, Spain, UAE, Kenya, Saudi Arabia, U.K., Germany" },
  { sl_no: 53, name: "Shree Mukund Impex", hall_no: "2C", stall_no: "B-07", address: "J-12/119, Dhoopchandi, Varanasi-221001", state: "Uttar Pradesh", contact_person: "Puneet", mobile_number: "95653 67667", landline_number: "", email: "s.mukund01@gmail.com", website: "www.shreemukundimpex.com", products_on_display: "Scarves, Stoles, Shawls, Muffler", export_markets: "USA, Italy, Japan, Turkey" },
  { sl_no: 54, name: "Zinnia (India)", hall_no: "2C", stall_no: "F-13", address: "B-44, Sector-58 Noida-201301", state: "Uttar Pradesh", contact_person: "Virat Kumar", mobile_number: "98103 97851", landline_number: "", email: "virat@hawkeyesindia.com", website: "", products_on_display: "Scarf Bag Garments", export_markets: "" },
  { sl_no: 55, name: "The Zinnia India", hall_no: "2C", stall_no: "F-13", address: "G-46, Sector-56, Noida-201301", state: "Uttar Pradesh", contact_person: "Virat Kumar", mobile_number: "98103 97852", landline_number: "", email: "virat@hawkeyesindia.com", website: "", products_on_display: "Scarf Bag Garments", export_markets: "" },
  { sl_no: 56, name: "Maloo Exports", hall_no: "2B", stall_no: "L-12", address: "Varah Ghat Chowk, Badi Basti, Pushkar-305022", state: "Rajasthan", contact_person: "Madhusudan Maloo", mobile_number: "98291 47225", landline_number: "", email: "malooexports@gmail.com", website: "", products_on_display: "Shorts,Skirts,Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts,Silk Garments", export_markets: "Europe Australia, U.K." },
  { sl_no: 57, name: "Aman Fashion", hall_no: "2C", stall_no: "G-01", address: "62/2/5, Site -4, Sahibabad Industrial Area, Ghaziabad-201010", state: "Uttar Pradesh", contact_person: "Avin Kumar Sadh", mobile_number: "98990 90135", landline_number: "", email: "amanfashion24@yahoo.com", website: "", products_on_display: "Beach Wear,Jeans/ Denim,Trousers,Skirts,Shorts,Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts,Tunics", export_markets: "Europe USA Brazil, Chile" },
  { sl_no: 58, name: "Orange Fashion Designs Private Limited", hall_no: "2B", stall_no: "N-07", address: "GP-45, Sector-18 Maruti Industrial Area, Gurgaon-122015", state: "Haryana", contact_person: "Vibhu Sehgal, Rajinder Kumar", mobile_number: "98112 84248, 79823 95854", landline_number: "", email: "vibhu@ofdpl.com;docs@ofdpl.com", website: "", products_on_display: "Silk Garments, Women Wear, Dresses, Blouses", export_markets: "UK, Italy, Spain" },
  { sl_no: 59, name: "Kartik Sourcing Private Limited", hall_no: "2A", stall_no: "U-01", address: "Unit-1022B, Tower-B4, Spaze-I Tech Park, Sohna Road,Sector-49, Gurgaon-122002", state: "Haryana", contact_person: "Seema Singh", mobile_number: "96546 42551", landline_number: "", email: "seema@kartiksourcing.com", website: "www.kartik-sourcing.com", products_on_display: "Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts,Body Wear,Private Labels- Fashion", export_markets: "Global" },
  { sl_no: 60, name: "Ridhi Fashions LLP", hall_no: "2C", stall_no: "F-09", address: "F-22, Sector-6, Noida-201301", state: "Uttar Pradesh", contact_person: "Sanjay Kumar Sadh", mobile_number: "98111 00632", landline_number: "", email: "info@kkfashionexports.com", website: "", products_on_display: "", export_markets: "" },
  { sl_no: 61, name: "K K Fashion Exports", hall_no: "2C", stall_no: "F-09", address: "C-142, Lajpat Nagar-I, New Delhi-110024", state: "Delhi", contact_person: "Sanjay Kumar Sadh", mobile_number: "98111 00633", landline_number: "-7296", email: "info@kkfashionexports.com", website: "www.kkfashionexports.com", products_on_display: "Beach Wear,TrousersShorts,Skirts,T-Shirts / Polos,Co-ordinates,Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts,Girls Wear,Scarf", export_markets: "Spain France Italy Greece USA" },
  { sl_no: 62, name: "Fancy Global", hall_no: "2B", stall_no: "K-09", address: "A-100, Sector-5, Noida-201301", state: "Uttar Pradesh", contact_person: "Shreyas Sadh", mobile_number: "98991 01900", landline_number: "", email: "shreyas@fancyglobal.in", website: "", products_on_display: "Beach Wear,Shorts,Skirts,Women 's Blouses,Women Dresses,Women 's Skirts", export_markets: "Denmark, USA, Australia, Europe, China" },
  { sl_no: 63, name: "Advvitaa Designs Private Limited", hall_no: "2C", stall_no: "G-01", address: "E-198-B, Sector 63, Noida-201301", state: "Uttar Pradesh", contact_person: "Hitten Aroraa", mobile_number: "98998 58555", landline_number: "", email: "director@advvitaa.com", website: "www.advvitaa.com", products_on_display: "Beach Wear,Trousers,Co-ordinates", export_markets: "Italy Australia USA" },
  { sl_no: 64, name: "Promila Creations", hall_no: "2B", stall_no: "L-10", address: "A-13, Sector-67, Noida-201301", state: "Uttar Pradesh", contact_person: "Sanjeev Gupta", mobile_number: "98116 05078", landline_number: "", email: "info@promilacreations.com", website: "", products_on_display: "Clutches, Belts, Women 's Blouses, Women Dresses", export_markets: "Western Europe USA Australia" },
  { sl_no: 65, name: "Buying Sources at India", hall_no: "2A", stall_no: "Q-05", address: "WE-121, Second Floor, Rama Park Road, Mohan Garden New Delhi-110059", state: "Delhi", contact_person: "Manjari Agnihotri", mobile_number: "98712 11524", landline_number: "", email: "manjariagnihotri@hotmail.com", website: "", products_on_display: "", export_markets: "USA, Australia, Spain" },
  { sl_no: 66, name: "VCI Exports Private Limited", hall_no: "2C", stall_no: "E-16", address: "12-A, Tejaji Marg, New Sanganer Road, Sodala, Jaipur-302019", state: "Rajasthan", contact_person: "Kunal Bohra", mobile_number: "99282 36294", landline_number: "", email: "kunal@vciexports.com", website: "www.vciexports.com", products_on_display: "", export_markets: "Germany Netherland Spain" },
  { sl_no: 67, name: "KA Jewels", hall_no: "2A", stall_no: "R-02", address: "E-50, EPIP, Site-V, Kasna Greater Noida-201308", state: "Uttar Pradesh", contact_person: "Saurabh Rastogi", mobile_number: "93501 16556", landline_number: "", email: "kaexports@yahoo.com", website: "www.kajewels.com", products_on_display: "Jewellery, Bags", export_markets: "USA , Europe" },
  { sl_no: 68, name: "Rankawat Exports", hall_no: "2C", stall_no: "E-06", address: "Dev Nagar Road, Pushkar-305022", state: "Rajasthan", contact_person: "Prem Kumar Rankawat", mobile_number: "94143 65810", landline_number: "", email: "rankawatexports101@gmail.com", website: "Insta : rankawat101", products_on_display: "", export_markets: "" },
  { sl_no: 69, name: "RPM Creations", hall_no: "2A", stall_no: "S-11", address: "C-116, Sector-65, Noida-201301", state: "Uttar Pradesh", contact_person: "Rachna Saini", mobile_number: "93501 07364", landline_number: "0120-435-0838 0120-457-0652", email: "info@rpmcreations.in", website: "", products_on_display: "Beach Wear,Trousers,Shorts,Skirts,Women Dresses,Women 's Trousers,Women 's Skirts,Girls Wear", export_markets: "UK Sweden Europe South Africa" },
  { sl_no: 70, name: "Central Himalayan Exports", hall_no: "2B", stall_no: "L-11", address: "C-73-B, Kalkaji, New Delhi-110019", state: "Delhi", contact_person: "Sanjay Kumar Jain", mobile_number: "98101 27277", landline_number: "", email: "pashminaid@gmail.com", website: "www.centralhimalayan.com", products_on_display: "Knitwear, Women Blouse, Jackets, Pullovers", export_markets: "" },
  { sl_no: 71, name: "Shriya India", hall_no: "2C", stall_no: "B-09", address: "4/23, Lane 11, NRI Colony, Loharka Road, Amrtisar-143001", state: "Punjab", contact_person: "Kratika Verma", mobile_number: "88608 99457", landline_number: "", email: "kratikaverma196@gmail.com", website: "", products_on_display: "Woollen Shawls, Stoles, Silk Scarf", export_markets: "UAE, USA, Europe" },
  { sl_no: 72, name: "Aryavart", hall_no: "2C", stall_no: "F-08", address: "G-87, EPIP, Sitapura Industrial Area, Jaipur-302022", state: "Rajasthan", contact_person: "Vivek Thakur", mobile_number: "98292 12753", landline_number: "0141-277-1186", email: "aryavart2@gmail.com", website: "www.aryavartexports.com", products_on_display: "Women Dresses,Women 's Trousers,Women 's Skirts,Tunics,Jackets", export_markets: "France USA Spain" },
  { sl_no: 73, name: "Universal Knitwears", hall_no: "2B", stall_no: "H-01", address: "448, E.P.I.P., Kundli Industrial Area, Sonipat-131028", state: "Haryana", contact_person: "Suraj Bhatia", mobile_number: "98112 22680", landline_number: "", email: "suraj@universalknitwears.com", website: "www.universalknitwears.com", products_on_display: "Weaters, Knitted Garments", export_markets: "USA, UK, Europe, Australia" },
  { sl_no: 74, name: "SB Creations", hall_no: "2C", stall_no: "E-05", address: "22-7-269, Dewan Devdi, Opposite Jubilee Post Office, Hyderabad-500002", state: "Telangana", contact_person: "Syed Suhail Ahmed", mobile_number: "98660 63672", landline_number: "", email: "suhail@satrufashion.com", website: "www.sbcreation.in", products_on_display: "", export_markets: "" },
  { sl_no: 75, name: "Aish Overseas", hall_no: "2A", stall_no: "S-09", address: "4348, Nathmal Ji Ka Chowk, Johari Bazaar, Jaipur-302003", state: "Rajasthan", contact_person: "Vikram Gupta", mobile_number: "86964 44448", landline_number: "", email: "aishoverseas9@gmail.com", website: "www.aishoverseas.com", products_on_display: "Beach Wear,Trousers,Skirts,Women 's Blouses,Women Dresses,Women 's Trousers", export_markets: "France Spain Australia Greece" },
  { sl_no: 76, name: "Promila Enterprises", hall_no: "2B", stall_no: "K-10", address: "First Floor, 139 F.I.E., Patparganj Industrial Area, Delhi-110002", state: "Delhi", contact_person: "Sanjay Suresh Guptaa", mobile_number: "98110 29557", landline_number: "011-430-92840", email: "promila@proemp.in", website: "www.promilaemporium.in", products_on_display: "Bags and Belts", export_markets: "France, Italy, Germany, Romania, Belgium, Norway, USA, Australia, Japan" },
  { sl_no: 77, name: "Promila Emporium", hall_no: "2B", stall_no: "K-10", address: "First Floor, 139 F.I.E., Patparganj Industrial Area, Delhi-110002", state: "Delhi", contact_person: "Sanjay Suresh Guptaa", mobile_number: "98110 29558", landline_number: "011-430-92840", email: "promila@proemp.in", website: "www.promilaemporium.in", products_on_display: "Bags and Belts", export_markets: "France, Italy, Germany, Romania, Belgium, Norway, USA, Australia, Japan" },
  { sl_no: 78, name: "A R Overseas", hall_no: "2A", stall_no: "O-04", address: "E-149, Lajpat Nagar-1st New Delhi", state: "Gujarat", contact_person: "Ansh Sadh", mobile_number: "96879 19304", landline_number: "", email: "aroverseas48@outlook.com", website: "www.aroverseas.info", products_on_display: "Beach Wear,Trousers,Shorts,SkirtsMen 's Shirts,Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts,Tunics", export_markets: "Europe UK USA  , Gulf" },
  { sl_no: 79, name: "Lila Shyam Exports", hall_no: "2B", stall_no: "H-10", address: "Near Brahma Mandir, Pushkar-305022", state: "Rajasthan", contact_person: "Mahender Kumar", mobile_number: "98281 76625", landline_number: "", email: "lilashyamexport@gmail.com", website: "www.lilashyam.com", products_on_display: "", export_markets: "Spain, Italy, France, USA, Brazil" },
  { sl_no: 80, name: "Rikhit Exports", hall_no: "2B", stall_no: "I-09", address: "F-462, Sector-63 Noida-201301", state: "Uttar Pradesh", contact_person: "Rikhit Sadh", mobile_number: "95999 98844", landline_number: "0120-311-1747", email: "admin@rikhitexports.com", website: "", products_on_display: "Beach Wear,Trousers,Shorts,Skirts,Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts,Silk Garments,Tunics,Knitwears", export_markets: "USA UK UAE Spain Australia" },
  { sl_no: 81, name: "Brecht", hall_no: "2C", stall_no: "D-04", address: "55 Mahadev Nagar, Gandhi Path, Queens Road, Vaishali Nagar, Jaipur-302021", state: "Rajasthan", contact_person: "Vaishali Agarwal", mobile_number: "93146 13513", landline_number: "", email: "vaishali@brecht.in", website: "", products_on_display: "Blouse, Dress, Trouser, Skirt, Shorts, Top, Kaftan, Jump Suit", export_markets: "Europe, South America, Kuwait, Bahrain &UAE" },
  { sl_no: 82, name: "Ahuja Textiles", hall_no: "2C", stall_no: "B-14", address: "S-48, Ground Floor, Okhla Industrial Area, Phase-2, New Delhi-110020", state: "Delhi", contact_person: "Hitesh Ahuja", mobile_number: "98100 55955", landline_number: "", email: "hitesh@ahujatex.com", website: "", products_on_display: "Kaftans, Hand Bags, Textile Accessories", export_markets: "Europe, USA, South America, Australia, Japan" },
  { sl_no: 84, name: "Ambe Garments", hall_no: "2C", stall_no: "E-15", address: "Surya Vihar, Dev Nagar Road, Pushkar-305022", state: "Rajasthan", contact_person: "Sonu Tak", mobile_number: "94143 00219", landline_number: "", email: "ambepushkar@gmail.com", website: "", products_on_display: "Men 's Shirts,Men 's Trousers,Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts,Jackets", export_markets: "Europe Australia UK USA Africa" },
  { sl_no: 85, name: "Shree Malani Clothing LLP", hall_no: "2B", stall_no: "I-01", address: "G-1, 153, Apparel Park, Industrial Area, Jagatpura Jaipur-302022", state: "Rajasthan", contact_person: "Harsh Lalwani/ Kapil Mehta", mobile_number: "99508 00009, 98296 33337", landline_number: "", email: "acc.shreemalaniclothing@gmail.com", website: "", products_on_display: "Trousers,Shorts,Skirts,Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts", export_markets: "Japan, USA, UK, Brazil, Spain" },
  { sl_no: 86, name: "Sini Designs Private Limited", hall_no: "2C", stall_no: "F-06", address: "G-27, Sector-63, Noida-201301", state: "Uttar Pradesh", contact_person: "Neetu Singh", mobile_number: "98117 47384", landline_number: "", email: "neetusingh@sinidesigns.com", website: "www.sinidesigns.com", products_on_display: "Beach Wear,Women Dresses,Women 's Trousers,Women 's Skirts,Tunics, Kaftans, Scarves", export_markets: "USA, UK, Italy, Portugal, Switzerland, Australia" },
  { sl_no: 87, name: "Ariastop Designs Private Limited", hall_no: "2A", stall_no: "R-01", address: "D.No. 10-198/2 Sri Sai Nagar Colony, Near Alluri Seetharamaraju Statue, Agnampudi, Visakhapatnam-530053", state: "Andhra Pradesh", contact_person: "N. RamaLakshmi", mobile_number: "77299 79999", landline_number: "", email: "varshasrivarma@gmail.com", website: "", products_on_display: "Shorts,Skirts,Women 's Blouses,Women Dresses,Women 's Skirts,Tunics", export_markets: "" },
  { sl_no: 88, name: "Sabnam Exports Private Limited", hall_no: "2C", stall_no: "C-12", address: "Plot No. A-15/16, Central Cross Road-B, MIDC, Andheri- East, Mumbai-400093", state: "Maharashtra", contact_person: "Rajesh Surana", mobile_number: "98202 17414", landline_number: "022-2820-5742 /43", email: "info@sabnamexports.com", website: "", products_on_display: "T-Shirts,Polo Shirts,Women 's Blouses,Women Dresses,Knitwears, Sleepwear and Payjamas", export_markets: "Russia UK South America Europe" },
  { sl_no: 89, name: "Vintage Affair", hall_no: "2C", stall_no: "C-01", address: "G-324, RIICO Industrial Area, Boranada 3rd Phase, Jodhpur-342001", state: "Rajasthan", contact_person: "Rishabh Jain", mobile_number: "98290 46949", landline_number: "", email: "vintageaffairofficial@yahoo.com", website: "", products_on_display: "Women Dresses,Women 's Trousers,Women 's Skirts", export_markets: "" },
  { sl_no: 90, name: "Kamarvy", hall_no: "2C", stall_no: "B-02", address: "WZ-266A, Madipur, New Delhi-110063", state: "Delhi", contact_person: "Umesh Kumar", mobile_number: "99539 55238", landline_number: "", email: "kamarvyimpex@gmail.com", website: "", products_on_display: "Jackets, Handbags, Woman Dresses", export_markets: "Spain, USA, Italy, Australia, Greece, Netherland, Turkey" },
  { sl_no: 91, name: "Rakheja Enterprises LLP", hall_no: "2C, 2B", stall_no: "D-12, L-09", address: "74 Udyog Vihar, Phase-4, Gurgaon-122001", state: "Haryana", contact_person: "Rajesh Rakheja", mobile_number: "98100 01615", landline_number: "", email: "rajeshrakheja@rakhejaenterprises.com", website: "", products_on_display: "", export_markets: "USA, France, UK, South Korea, Portugal, Saudi Arabia" },
  { sl_no: 92, name: "Saryu Prints", hall_no: "2A", stall_no: "T-04", address: "257 Katta Street, Tonk Road, Durgapura, Jaipur-302018", state: "Rajasthan", contact_person: "Tarun Katta", mobile_number: "98283 99479", landline_number: "", email: "saryuprints@gmail.com", website: "www.saryuprints.com", products_on_display: "Skirts,Women Dresses,Jackets,Pullovers", export_markets: "USA, UK, Australia, Europe" },
  { sl_no: 93, name: "Apparel Fashionista", hall_no: "2C", stall_no: "D-10", address: "B-13, Sector-69 Noida-201301", state: "Uttar Pradesh", contact_person: "Leena Sadh", mobile_number: "87503 48074", landline_number: "", email: "apparelfashionista@gmail.com", website: "", products_on_display: "Beach Wear,Trousers,Shorts,Skirts,Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts,Tunics,Jackets", export_markets: "France Spain Australia" },
  { sl_no: 94, name: "Ellora Enterprises", hall_no: "2B", stall_no: "M-13", address: "B-21, Sector-9, Noida-201301", state: "Uttar Pradesh", contact_person: "Vineet Kumar Sadh", mobile_number: "98102 54872", landline_number: "", email: "elloraent1@gmail.com", website: "www.elloraenterprises.in", products_on_display: "Women 's Blouses,Women Dresses,Women 's Trousers,Women 's Skirts", export_markets: "" },
  { sl_no: 95, name: "Satkartar Fashion House", hall_no: "2B", stall_no: "K-07", address: "F-5, Rajouri Garden, New Delhi-110027", state: "Delhi", contact_person: "Anand Gulati", mobile_number: "98108 33777", landline_number: "", email: "anandgulati.7@gmail.com", website: "www.satkartarfashiongroup.com", products_on_display: "High Fashion Beaded Ladies Garment, Women Dresses,Women 's Skirts,Private Labels- Fashion,Bridal Wear", export_markets: "USA, EU, UK, Asian Countries" },
  { sl_no: 96, name: "Printtech", hall_no: "2B", stall_no: "K-08", address: "D-84, Hosiery Complex, Phase-2 Noida-201305", state: "Uttar Pradesh", contact_person: "Siddhartha Jain", mobile_number: "98108 86666", landline_number: "", email: "ceo@printtech.in", website: "www.printtech.in", products_on_display: "Co-ordinates,Kaftan,Designer Labels - Fashion, Private Labels- Fashion", export_markets: "UAE, Malaysia,Kuwait, Bahrain, Saudi Arabia" },
  { sl_no: 97, name: "YVNS MomKids Fashion LLP", hall_no: "2C", stall_no: "C-09", address: "172/12/1, Yamuna Vihar, Ward No. 05 Shamsherpur, Paonta Sahib, Sirmaur-173025", state: "Himachal Pradesh", contact_person: "Saumya Aggarwal Tyagi", mobile_number: "98055 14131", landline_number: "", email: "support@shopthetaa.com", website: "www.shopthetaa.com", products_on_display: "Women Dresses,Women 's Skirts,Silk Garments,Girls Wear,Boys 'Wear,Designer Labels - Fashion,Bridal Wear", export_markets: "USA, Canada, Australia, UK, Mexico" },
  { sl_no: 98, name: "Neeta 's Creations LLP", hall_no: "2C", stall_no: "E-13", address: "W-38, Okhla Industrial Area, Phase-2 New Delhi-110020", state: "Delhi", contact_person: "Neeta Monga", mobile_number: "98100 03135", landline_number: "", email: "neeta@neetas.in", website: "", products_on_display: "Infants wear,Girls Wear,Boys 'Wear", export_markets: "" },
];

export default function ExportersList() {
  const { exporters, isLoading, bulkAddExporters, updateExporter, deleteExporter } = useExporters();
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [marketFilter, setMarketFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedExporter, setSelectedExporter] = useState<Exporter | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<ExporterInput>>({});

  // Seed data on first load if no exporters exist
  useEffect(() => {
    if (!isLoading && exporters.length === 0) {
      bulkAddExporters.mutate(INITIAL_EXPORTERS_DATA);
    }
  }, [isLoading, exporters.length]);

  // Extract unique states and markets for filters
  const uniqueStates = useMemo(() => {
    const states = new Set(exporters.map(e => e.state).filter(Boolean));
    return Array.from(states).sort();
  }, [exporters]);

  const uniqueMarkets = useMemo(() => {
    const allMarkets = exporters
      .flatMap(e => (e.export_markets || '').split(',').map(m => m.trim()))
      .filter(Boolean);
    const markets = new Set(allMarkets);
    return Array.from(markets).sort();
  }, [exporters]);

  // Filter and search exporters
  const filteredExporters = useMemo(() => {
    return exporters.filter(exporter => {
      const matchesSearch = searchQuery === '' ||
        exporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exporter.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exporter.mobile_number?.includes(searchQuery) ||
        exporter.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exporter.products_on_display?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exporter.address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesState = stateFilter === 'all' || exporter.state === stateFilter;
      
      const matchesMarket = marketFilter === 'all' || 
        exporter.export_markets?.toLowerCase().includes(marketFilter.toLowerCase());
      
      return matchesSearch && matchesState && matchesMarket;
    });
  }, [exporters, searchQuery, stateFilter, marketFilter]);

  // Pagination
  const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredExporters.length / pageSize);
  const paginatedExporters = useMemo(() => {
    if (pageSize === -1) return filteredExporters;
    const start = (currentPage - 1) * pageSize;
    return filteredExporters.slice(start, start + pageSize);
  }, [filteredExporters, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, stateFilter, marketFilter, pageSize]);

  const handleViewExporter = (exporter: Exporter) => {
    setSelectedExporter(exporter);
    setIsViewDialogOpen(true);
  };

  const handleEditExporter = (exporter: Exporter) => {
    setSelectedExporter(exporter);
    setEditFormData({
      name: exporter.name,
      hall_no: exporter.hall_no,
      stall_no: exporter.stall_no,
      address: exporter.address,
      state: exporter.state,
      contact_person: exporter.contact_person,
      mobile_number: exporter.mobile_number,
      landline_number: exporter.landline_number,
      email: exporter.email,
      website: exporter.website,
      products_on_display: exporter.products_on_display,
      export_markets: exporter.export_markets,
      notes: exporter.notes,
      is_active: exporter.is_active ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedExporter) {
      updateExporter.mutate({ id: selectedExporter.id, ...editFormData });
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteExporter = (id: string) => {
    if (confirm('Are you sure you want to delete this exporter?')) {
      deleteExporter.mutate(id);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'State', 'Contact Person', 'Mobile', 'Email', 'Products', 'Export Markets'];
    const csvContent = [
      headers.join(','),
      ...filteredExporters.map(e => [
        `"${e.name}"`,
        `"${e.state || ''}"`,
        `"${e.contact_person || ''}"`,
        `"${e.mobile_number}"`,
        `"${e.email || ''}"`,
        `"${e.products_on_display || ''}"`,
        `"${e.export_markets || ''}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exporters-list.csv';
    a.click();
    toast.success('CSV exported successfully');
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Indian Exporters Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive database of verified Indian garment exporters
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => bulkAddExporters.mutate(INITIAL_EXPORTERS_DATA)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Exporters</p>
                <p className="text-2xl font-bold">{exporters.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">States Covered</p>
                <p className="text-2xl font-bold">{uniqueStates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Export Markets</p>
                <p className="text-2xl font-bold">{uniqueMarkets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Filter className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Filtered Results</p>
                <p className="text-2xl font-bold">{filteredExporters.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, contact, mobile, email, products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {uniqueStates.map(state => (
                  <SelectItem key={state} value={state!}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {uniqueMarkets.slice(0, 30).map(market => (
                  <SelectItem key={market} value={market}>{market}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(searchQuery || stateFilter !== 'all' || marketFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {stateFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  State: {stateFilter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setStateFilter('all')} />
                </Badge>
              )}
              {marketFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Market: {marketFilter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setMarketFilter('all')} />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStateFilter('all');
                  setMarketFilter('all');
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg">Exporters List</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(v === 'all' ? -1 : Number(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Location</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Products</TableHead>
                  <TableHead className="font-semibold hidden xl:table-cell">Markets</TableHead>
                  <TableHead className="font-semibold w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExporters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="h-12 w-12 opacity-30" />
                        <p>No exporters found matching your criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedExporters.map((exporter) => (
                    <TableRow key={exporter.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{exporter.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            Hall {exporter.hall_no}, Stall {exporter.stall_no}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{exporter.contact_person || '-'}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {exporter.mobile_number}
                          </div>
                          {exporter.email && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{exporter.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          <Badge variant="outline" className="font-normal">{exporter.state || 'N/A'}</Badge>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{exporter.address}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                          {exporter.products_on_display || '-'}
                        </p>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {exporter.export_markets?.split(',').slice(0, 3).map((market, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs font-normal">
                              {market.trim()}
                            </Badge>
                          ))}
                          {(exporter.export_markets?.split(',').length || 0) > 3 && (
                            <Badge variant="secondary" className="text-xs font-normal">
                              +{(exporter.export_markets?.split(',').length || 0) - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewExporter(exporter)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditExporter(exporter)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteExporter(exporter.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pageSize !== -1 && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredExporters.length)} of {filteredExporters.length} entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedExporter?.name}</DialogTitle>
            <DialogDescription>Complete exporter details</DialogDescription>
          </DialogHeader>
          {selectedExporter && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Hall & Stall</p>
                  <p>Hall {selectedExporter.hall_no}, Stall {selectedExporter.stall_no}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">State</p>
                  <Badge>{selectedExporter.state || 'N/A'}</Badge>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-sm">{selectedExporter.address || '-'}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                  <p>{selectedExporter.contact_person || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {selectedExporter.mobile_number}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Landline</p>
                  <p>{selectedExporter.landline_number || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {selectedExporter.email || '-'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Website</p>
                <p className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {selectedExporter.website || '-'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Products on Display</p>
                <div className="flex flex-wrap gap-1">
                  {selectedExporter.products_on_display?.split(',').map((product, idx) => (
                    <Badge key={idx} variant="outline" className="font-normal">
                      {product.trim()}
                    </Badge>
                  )) || <span className="text-muted-foreground">-</span>}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Export Markets</p>
                <div className="flex flex-wrap gap-1">
                  {selectedExporter.export_markets?.split(',').map((market, idx) => (
                    <Badge key={idx} variant="secondary" className="font-normal">
                      {market.trim()}
                    </Badge>
                  )) || <span className="text-muted-foreground">-</span>}
                </div>
              </div>

              {selectedExporter.notes && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedExporter.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exporter</DialogTitle>
            <DialogDescription>Update exporter information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  value={editFormData.contact_person || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Mobile Number *</Label>
                <Input
                  value={editFormData.mobile_number || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Landline</Label>
                <Input
                  value={editFormData.landline_number || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, landline_number: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={editFormData.website || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Hall No.</Label>
                <Input
                  value={editFormData.hall_no || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, hall_no: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Stall No.</Label>
                <Input
                  value={editFormData.stall_no || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, stall_no: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={editFormData.state || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Products on Display</Label>
              <Textarea
                value={editFormData.products_on_display || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, products_on_display: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Export Markets</Label>
              <Textarea
                value={editFormData.export_markets || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, export_markets: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editFormData.notes || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={editFormData.is_active ?? true}
                onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateExporter.isPending}>
              {updateExporter.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
