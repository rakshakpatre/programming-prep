import React from 'react'

export default function Footer() {
    return (
        <footer class="footer mt-auto py-3 bg-light shadow-lg p-3 mt-5 bg-body rounded">
            <div class="container text-center">
                <span class="text-muted">&copy; {new Date().getFullYear()} <a href="/" style={{ textDecoration: 'none' }}> &lt;/&gt;Programming.Prep</a> All rights reserved.</span>
            </div>
        </footer >
    )
}
