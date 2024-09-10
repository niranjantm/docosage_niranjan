import React, { useState } from 'react';
import Link from 'next/link'; // For routing if needed
import { FaAngleRight, FaAngleDown } from 'react-icons/fa'; // Arrow icons

function SidebarItem({ item }) {
  const [open, setOpen] = useState(false);

  // Toggle the submenu on click
  const toggleSubMenu = () => {
    setOpen(!open);
  };

  return (
    <div className="sidebar-item">
      {/* If the item has children (submenu), we toggle the submenu */}
      {item.children ? (
        <>
          <div className="sidebar-title" onClick={toggleSubMenu}>
            <span>{item.title}</span>
            <span>{open ? <FaAngleDown /> : <FaAngleRight />}</span>
          </div>
          {/* Sub-menu will show only when open */}
          {open && (
            <div className="sidebar-submenu">
              {item.children.map((child, index) => (
                <SidebarItem key={index} item={child} />
              ))}
            </div>
          )}
        </>
      ) : (
        <Link href={item.path || "#"} className="sidebar-link">
          {item.title}
        </Link>
      )}
    </div>
  );
}

export default SidebarItem;